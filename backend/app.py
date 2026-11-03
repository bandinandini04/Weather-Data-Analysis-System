"""
Weather Data Analysis System - Flask Backend API
Production-ready REST API implementing real CSV parsing, Pandas statistical analysis,
MySQL persistence with parameterized queries, and ReportLab PDF document compilation.
"""

import os
import io
from pathlib import Path
from typing import Dict, Any, Optional

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import pandas as pd
import numpy as np

# Internal module imports
from config import (
    PORT,
    DEBUG,
    CORS_ORIGINS,
    SAMPLE_CSV_PATH,
    REQUIRED_COLUMNS,
    MAX_CONTENT_LENGTH,
    ALLOWED_EXTENSIONS
)
from database import db_instance
from modules.data_validation import validate_weather_data
from modules.data_processing import process_weather_data, filter_weather_data
from modules.weather_analysis import (
    compute_overall_statistics,
    compute_monthly_analysis,
    compute_daily_analysis,
    compute_location_analysis
)
from modules.report_generation import dataframe_to_csv_bytes, generate_pdf_summary_report

# Initialize Flask App
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Enable CORS for React Frontend (supports local dev and deployed frontend domains)
if CORS_ORIGINS == "*":
    CORS(app, resources={r"/api/*": {"origins": "*"}})
else:
    origins = [orig.strip() for orig in CORS_ORIGINS.split(",") if orig.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}})

# In-memory storage for active working session
SESSION_DATA: Dict[str, Any] = {
    "raw_df": None,
    "valid_df": pd.DataFrame(),
    "invalid_df": pd.DataFrame(),
    "processed_df": pd.DataFrame(),
    "validation_summary": {
        "total_records": 0,
        "accepted_records": 0,
        "rejected_records": 0,
        "acceptance_rate_pct": 0,
        "missing_values_count": 0,
        "duplicates_count": 0,
        "invalid_dates_count": 0,
        "non_numeric_count": 0,
        "out_of_range_temp_count": 0,
        "out_of_range_humidity_count": 0,
        "negative_rainfall_count": 0,
    },
    "dataset_name": "None"
}


def load_dataset_into_session(df_input: pd.DataFrame, source_name: str):
    """Processes, validates, and stores dataset in the backend session."""
    valid_df, invalid_df, summary = validate_weather_data(df_input)
    processed_df = process_weather_data(valid_df)

    SESSION_DATA["raw_df"] = df_input
    SESSION_DATA["valid_df"] = valid_df
    SESSION_DATA["invalid_df"] = invalid_df
    SESSION_DATA["processed_df"] = processed_df
    SESSION_DATA["validation_summary"] = summary
    SESSION_DATA["dataset_name"] = source_name

    # Try inserting valid records into MySQL if connected
    if db_instance.is_connected and not valid_df.empty:
        try:
            db_instance.insert_records(valid_df)
        except Exception as e:
            app.logger.warning(f"MySQL auto-insert skipped: {e}")

    return summary


# Auto-load built-in sample data on startup
if os.path.exists(SAMPLE_CSV_PATH):
    try:
        sample_df = pd.read_csv(SAMPLE_CSV_PATH)
        load_dataset_into_session(sample_df, "sample_weather.csv")
    except Exception as err:
        app.logger.error(f"Failed to auto-load sample weather CSV: {err}")


# =========================================================================
# 1. GET /api/health
# =========================================================================
@app.route("/api/health", methods=["GET"])
def health_check():
    """Returns backend system status, active dataset details, and MySQL status."""
    db_stat = db_instance.get_status()
    return jsonify({
        "status": "ok",
        "service": "Weather Data Analysis System API",
        "version": "2.0.0",
        "database": db_stat,
        "active_dataset": SESSION_DATA["dataset_name"],
        "records_count": len(SESSION_DATA["valid_df"]),
        "anomalies_count": len(SESSION_DATA["invalid_df"])
    })


# =========================================================================
# 2. GET /api/dashboard
# =========================================================================
@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """
    Returns primary dashboard statistics, monthly trends, and recent records.
    Uses actual uploaded dataset without hardcoded sample metrics.
    """
    valid_df = SESSION_DATA["valid_df"]
    processed_df = SESSION_DATA["processed_df"]
    summary = SESSION_DATA["validation_summary"]

    if valid_df.empty:
        return jsonify({
            "has_data": False,
            "message": "No weather dataset has been loaded yet. Please upload a CSV file.",
            "metrics": {
                "total_records": 0,
                "avg_temp": 0.0,
                "avg_humidity": 0.0,
                "total_rainfall": 0.0,
                "valid_records": 0,
                "invalid_records": 0,
                "acceptance_rate_pct": 0.0
            },
            "monthly_trends": [],
            "recent_records": []
        })

    stats = compute_overall_statistics(valid_df)
    monthly_df = compute_monthly_analysis(processed_df)

    # 10 Most recent observations
    recent = valid_df.sort_values(by="observation_date", ascending=False).head(10).to_dict(orient="records")

    return jsonify({
        "has_data": True,
        "dataset_name": SESSION_DATA["dataset_name"],
        "metrics": {
            "total_records": summary["total_records"],
            "avg_temp": stats["avg_temp"],
            "min_temp": stats["min_temp"],
            "max_temp": stats["max_temp"],
            "avg_humidity": stats["avg_humidity"],
            "min_humidity": stats["min_humidity"],
            "max_humidity": stats["max_humidity"],
            "total_rainfall": stats["total_rainfall"],
            "avg_rainfall": stats["avg_rainfall"],
            "max_rainfall": stats["max_rainfall"],
            "valid_records": summary["accepted_records"],
            "invalid_records": summary["rejected_records"],
            "acceptance_rate_pct": summary["acceptance_rate_pct"],
            "unique_locations": stats["unique_locations"],
            "start_date": stats["start_date"],
            "end_date": stats["end_date"]
        },
        "monthly_trends": monthly_df.to_dict(orient="records"),
        "recent_records": recent
    })


# =========================================================================
# 3. POST /api/upload
# =========================================================================
@app.route("/api/upload", methods=["POST"])
def upload_csv():
    """
    Ingests and validates a user-uploaded CSV weather dataset.
    Accepts multipart/form-data with 'file', or JSON payload with 'csv_text'.
    """
    filename = "uploaded_weather.csv"
    raw_df = None

    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        if not file.filename.lower().endswith(".csv"):
            return jsonify({"error": "Invalid file format. Only .csv files are supported."}), 400

        filename = file.filename
        try:
            raw_df = pd.read_csv(file.stream)
        except Exception as e:
            return jsonify({"error": f"Failed to parse CSV file: {str(e)}"}), 400

    elif request.is_json:
        data = request.get_json()
        csv_text = data.get("csv_text", "")
        filename = data.get("filename", "pasted_weather.csv")
        if not csv_text.strip():
            return jsonify({"error": "Empty CSV content provided."}), 400

        try:
            raw_df = pd.read_csv(io.StringIO(csv_text))
        except Exception as e:
            return jsonify({"error": f"Failed to parse CSV content: {str(e)}"}), 400
    else:
        return jsonify({"error": "Expected multipart file upload or JSON payload with csv_text."}), 400

    if raw_df is None or raw_df.empty:
        return jsonify({"error": "Uploaded CSV file contains no data rows."}), 400

    # Validate required columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in raw_df.columns]
    if missing_cols:
        return jsonify({
            "error": f"Missing mandatory columns: {', '.join(missing_cols)}",
            "required_columns": REQUIRED_COLUMNS
        }), 400

    try:
        summary = load_dataset_into_session(raw_df, filename)
        return jsonify({
            "success": True,
            "message": f"Successfully ingested and validated '{filename}'.",
            "filename": filename,
            "validation_summary": summary,
            "preview": raw_df.head(5).to_dict(orient="records")
        })
    except Exception as err:
        return jsonify({"error": f"Validation processing failed: {str(err)}"}), 500


# =========================================================================
# 4. GET /api/analysis
# =========================================================================
@app.route("/api/analysis", methods=["GET"])
def get_analysis():
    """
    Computes filtered statistics, monthly aggregations, daily timelines, and location comparisons.
    Supports query parameters:
    - locations (comma-separated, e.g. 'Mumbai,New Delhi')
    - start_date (YYYY-MM-DD)
    - end_date (YYYY-MM-DD)
    - months (comma-separated ints, e.g. '1,2,3')
    - years (comma-separated ints, e.g. '2023,2024')
    """
    df = SESSION_DATA["processed_df"]
    if df.empty:
        return jsonify({
            "has_data": False,
            "message": "No weather data loaded."
        })

    # Parse query filters
    locations_arg = request.args.get("locations")
    locations = [l.strip() for l in locations_arg.split(",") if l.strip()] if locations_arg else None

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    months_arg = request.args.get("months")
    months = [int(m.strip()) for m in months_arg.split(",") if m.strip().isdigit()] if months_arg else None

    years_arg = request.args.get("years")
    years = [int(y.strip()) for y in years_arg.split(",") if y.strip().isdigit()] if years_arg else None

    filtered_df = filter_weather_data(
        df,
        locations=locations,
        start_date=start_date,
        end_date=end_date,
        months=months,
        years=years
    )

    stats = compute_overall_statistics(filtered_df)
    monthly_df = compute_monthly_analysis(filtered_df)
    daily_df = compute_daily_analysis(filtered_df)
    location_df = compute_location_analysis(filtered_df)

    return jsonify({
        "has_data": True,
        "total_records": len(df),
        "filtered_count": len(filtered_df),
        "statistics": stats,
        "monthly_analysis": monthly_df.to_dict(orient="records"),
        "daily_analysis": daily_df.to_dict(orient="records"),
        "location_analysis": location_df.to_dict(orient="records")
    })


# =========================================================================
# 5. GET /api/records
# =========================================================================
@app.route("/api/records", methods=["GET"])
def get_records():
    """
    Paginated, searchable, and sortable records endpoint.
    Query parameters:
    - tab: 'valid' (default) or 'invalid'
    - search: location query
    - date: observation_date exact match
    - sort: column name
    - order: 'asc' or 'desc'
    - page: 1-indexed page number (default 1)
    - page_size: items per page (default 20)
    """
    tab = request.args.get("tab", "valid").lower()
    search = request.args.get("search", "").strip().lower()
    date_filter = request.args.get("date", "").strip()
    sort_col = request.args.get("sort", "observation_date")
    order = request.args.get("order", "asc").lower()
    page = max(1, int(request.args.get("page", 1)))
    page_size = max(1, min(100, int(request.args.get("page_size", 20))))

    target_df = SESSION_DATA["valid_df"] if tab == "valid" else SESSION_DATA["invalid_df"]

    if target_df.empty:
        return jsonify({
            "records": [],
            "total_count": 0,
            "page": page,
            "total_pages": 0
        })

    df_filtered = target_df.copy()

    # Apply search filter
    if search:
        df_filtered = df_filtered[df_filtered["location"].astype(str).str.lower().str.contains(search, na=False)]

    # Apply date filter
    if date_filter:
        df_filtered = df_filtered[df_filtered["observation_date"].astype(str) == date_filter]

    # Apply sorting
    if sort_col in df_filtered.columns:
        ascending = order == "asc"
        df_filtered.sort_values(by=sort_col, ascending=ascending, inplace=True)

    total_count = len(df_filtered)
    total_pages = max(1, int(np.ceil(total_count / page_size)))
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    sliced = df_filtered.iloc[start_idx:end_idx].to_dict(orient="records")

    return jsonify({
        "records": sliced,
        "total_count": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "tab": tab
    })


# =========================================================================
# 6. GET /api/reports/cleaned-csv
# =========================================================================
@app.route("/api/reports/cleaned-csv", methods=["GET"])
def download_cleaned_csv():
    """Generates and streams cleaned valid records as downloadable CSV."""
    valid_df = SESSION_DATA["valid_df"]
    if valid_df.empty:
        return jsonify({"error": "No valid weather data available to export."}), 404

    csv_bytes = dataframe_to_csv_bytes(valid_df)
    return Response(
        csv_bytes,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=cleaned_weather_data.csv"}
    )


# =========================================================================
# 7. GET /api/reports/monthly-csv
# =========================================================================
@app.route("/api/reports/monthly-csv", methods=["GET"])
def download_monthly_csv():
    """Generates and streams monthly aggregations as downloadable CSV."""
    processed_df = SESSION_DATA["processed_df"]
    if processed_df.empty:
        return jsonify({"error": "No weather data available to export."}), 404

    monthly_df = compute_monthly_analysis(processed_df)
    csv_bytes = dataframe_to_csv_bytes(monthly_df)
    return Response(
        csv_bytes,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=monthly_weather_analysis.csv"}
    )


# =========================================================================
# 8. GET /api/reports/quality-csv
# =========================================================================
@app.route("/api/reports/quality-csv", methods=["GET"])
def download_quality_csv():
    """Generates and streams data quality rejection audit log as CSV."""
    invalid_df = SESSION_DATA["invalid_df"]
    if invalid_df.empty:
        # Return clean placeholder
        empty_log = pd.DataFrame([{"message": "No invalid records detected in dataset."}])
        csv_bytes = dataframe_to_csv_bytes(empty_log)
    else:
        csv_bytes = dataframe_to_csv_bytes(invalid_df)

    return Response(
        csv_bytes,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=data_quality_audit_log.csv"}
    )


# =========================================================================
# 9. GET /api/reports/pdf
# =========================================================================
@app.route("/api/reports/pdf", methods=["GET"])
def download_pdf_report():
    """Generates and streams formal B.Tech CSE Weather Analysis Report as PDF."""
    valid_df = SESSION_DATA["valid_df"]
    if valid_df.empty:
        return jsonify({"error": "No weather data available to compile PDF report."}), 404

    stats = compute_overall_statistics(valid_df)
    monthly_df = compute_monthly_analysis(SESSION_DATA["processed_df"])
    validation_summary = SESSION_DATA["validation_summary"]
    dataset_name = SESSION_DATA["dataset_name"]

    try:
        pdf_bytes = generate_pdf_summary_report(
            summary_stats=stats,
            monthly_df=monthly_df,
            validation_summary=validation_summary,
            dataset_name=dataset_name
        )
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="Weather_Analysis_Report.pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500


# =========================================================================
# 10. POST /api/reset-sample
# =========================================================================
@app.route("/api/reset-sample", methods=["POST"])
def reset_to_sample_dataset():
    """Resets the backend session with the built-in 365+ sample weather records."""
    if not os.path.exists(SAMPLE_CSV_PATH):
        return jsonify({"error": "Sample weather dataset not found on server."}), 404

    try:
        sample_df = pd.read_csv(SAMPLE_CSV_PATH)
        summary = load_dataset_into_session(sample_df, "sample_weather.csv")
        return jsonify({
            "success": True,
            "message": "Reset to authentic sample weather dataset.",
            "validation_summary": summary
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "API route not found."}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error occurred."}), 500


if __name__ == "__main__":
    print(f"🚀 Starting Weather Data Analysis System Flask Server on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
