/**
 * Full-stack Source Files Metadata & Content
 * Used by the in-browser Code Explorer and 1-Click ZIP Exporter.
 */

export interface PythonFileMeta {
  path: string;
  name: string;
  language: string;
  category: "core" | "module" | "config" | "data" | "doc" | "deploy";
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: PythonFileMeta[] = [
  {
    path: "backend/app.py",
    name: "app.py",
    language: "python",
    category: "core",
    description: "Production Flask REST API with Flask-CORS, endpoints for dashboard, upload, analysis, records, and reports",
    content: `"""
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

from config import (
    PORT,
    DEBUG,
    CORS_ORIGINS,
    SAMPLE_CSV_PATH,
    REQUIRED_COLUMNS,
    MAX_CONTENT_LENGTH
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

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app, resources={r"/api/*": {"origins": "*"}})

SESSION_DATA: Dict[str, Any] = {
    "raw_df": None,
    "valid_df": pd.DataFrame(),
    "invalid_df": pd.DataFrame(),
    "processed_df": pd.DataFrame(),
    "validation_summary": {
        "total_records": 0, "accepted_records": 0, "rejected_records": 0,
        "acceptance_rate_pct": 0, "missing_values_count": 0, "duplicates_count": 0,
        "invalid_dates_count": 0, "non_numeric_count": 0, "out_of_range_temp_count": 0,
        "out_of_range_humidity_count": 0, "negative_rainfall_count": 0
    },
    "dataset_name": "None"
}

def load_dataset_into_session(df_input: pd.DataFrame, source_name: str):
    valid_df, invalid_df, summary = validate_weather_data(df_input)
    processed_df = process_weather_data(valid_df)
    SESSION_DATA["raw_df"] = df_input
    SESSION_DATA["valid_df"] = valid_df
    SESSION_DATA["invalid_df"] = invalid_df
    SESSION_DATA["processed_df"] = processed_df
    SESSION_DATA["validation_summary"] = summary
    SESSION_DATA["dataset_name"] = source_name
    if db_instance.is_connected and not valid_df.empty:
        try:
            db_instance.insert_records(valid_df)
        except Exception:
            pass
    return summary

# Preload built-in sample data
if os.path.exists(SAMPLE_CSV_PATH):
    try:
        sample_df = pd.read_csv(SAMPLE_CSV_PATH)
        load_dataset_into_session(sample_df, "sample_weather.csv")
    except Exception:
        pass

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "Weather Data Analysis System API",
        "version": "2.0.0",
        "database": db_instance.get_status(),
        "active_dataset": SESSION_DATA["dataset_name"],
        "records_count": len(SESSION_DATA["valid_df"]),
        "anomalies_count": len(SESSION_DATA["invalid_df"])
    })

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    valid_df = SESSION_DATA["valid_df"]
    if valid_df.empty:
        return jsonify({"has_data": False, "message": "No weather data loaded."})
    stats = compute_overall_statistics(valid_df)
    monthly_df = compute_monthly_analysis(SESSION_DATA["processed_df"])
    recent = valid_df.sort_values(by="observation_date", ascending=False).head(10).to_dict(orient="records")
    return jsonify({
        "has_data": True,
        "dataset_name": SESSION_DATA["dataset_name"],
        "metrics": {
            "total_records": SESSION_DATA["validation_summary"]["total_records"],
            "avg_temp": stats["avg_temp"],
            "min_temp": stats["min_temp"],
            "max_temp": stats["max_temp"],
            "avg_humidity": stats["avg_humidity"],
            "min_humidity": stats["min_humidity"],
            "max_humidity": stats["max_humidity"],
            "total_rainfall": stats["total_rainfall"],
            "avg_rainfall": stats["avg_rainfall"],
            "max_rainfall": stats["max_rainfall"],
            "valid_records": SESSION_DATA["validation_summary"]["accepted_records"],
            "invalid_records": SESSION_DATA["validation_summary"]["rejected_records"],
            "acceptance_rate_pct": SESSION_DATA["validation_summary"]["acceptance_rate_pct"],
            "unique_locations": stats["unique_locations"],
            "start_date": stats["start_date"],
            "end_date": stats["end_date"]
        },
        "monthly_trends": monthly_df.to_dict(orient="records"),
        "recent_records": recent
    })

@app.route("/api/upload", methods=["POST"])
def upload_csv():
    filename = "uploaded_weather.csv"
    if "file" in request.files:
        file = request.files["file"]
        filename = file.filename
        raw_df = pd.read_csv(file.stream)
    elif request.is_json:
        data = request.get_json()
        raw_df = pd.read_csv(io.StringIO(data.get("csv_text", "")))
        filename = data.get("filename", "weather.csv")
    else:
        return jsonify({"error": "No file or payload found."}), 400

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in raw_df.columns]
    if missing_cols:
        return jsonify({"error": f"Missing columns: {', '.join(missing_cols)}"}), 400

    summary = load_dataset_into_session(raw_df, filename)
    return jsonify({
        "success": True,
        "message": f"Successfully ingested {filename}",
        "filename": filename,
        "validation_summary": summary,
        "preview": raw_df.head(5).to_dict(orient="records")
    })

@app.route("/api/analysis", methods=["GET"])
def get_analysis():
    df = SESSION_DATA["processed_df"]
    if df.empty:
        return jsonify({"has_data": False})
    # Read query parameters
    locations = request.args.get("locations")
    loc_list = [l.strip() for l in locations.split(",") if l.strip()] if locations else None
    filtered_df = filter_weather_data(df, locations=loc_list)
    return jsonify({
        "has_data": True,
        "statistics": compute_overall_statistics(filtered_df),
        "monthly_analysis": compute_monthly_analysis(filtered_df).to_dict(orient="records"),
        "daily_analysis": compute_daily_analysis(filtered_df).to_dict(orient="records"),
        "location_analysis": compute_location_analysis(filtered_df).to_dict(orient="records")
    })

@app.route("/api/records", methods=["GET"])
def get_records():
    tab = request.args.get("tab", "valid")
    target_df = SESSION_DATA["valid_df"] if tab == "valid" else SESSION_DATA["invalid_df"]
    page = max(1, int(request.args.get("page", 1)))
    page_size = max(1, min(100, int(request.args.get("page_size", 20))))
    start = (page - 1) * page_size
    sliced = target_df.iloc[start:start + page_size].to_dict(orient="records")
    return jsonify({
        "records": sliced,
        "total_count": len(target_df),
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, int(np.ceil(len(target_df) / page_size)))
    })

@app.route("/api/reports/cleaned-csv", methods=["GET"])
def download_cleaned():
    return Response(dataframe_to_csv_bytes(SESSION_DATA["valid_df"]), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=cleaned_weather_data.csv"})

@app.route("/api/reports/monthly-csv", methods=["GET"])
def download_monthly():
    return Response(dataframe_to_csv_bytes(compute_monthly_analysis(SESSION_DATA["processed_df"])), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=monthly_weather_analysis.csv"})

@app.route("/api/reports/quality-csv", methods=["GET"])
def download_quality():
    return Response(dataframe_to_csv_bytes(SESSION_DATA["invalid_df"]), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=data_quality_audit_log.csv"})

@app.route("/api/reports/pdf", methods=["GET"])
def download_pdf():
    pdf_bytes = generate_pdf_summary_report(compute_overall_statistics(SESSION_DATA["valid_df"]), compute_monthly_analysis(SESSION_DATA["processed_df"]), SESSION_DATA["validation_summary"], SESSION_DATA["dataset_name"])
    return send_file(io.BytesIO(pdf_bytes), mimetype="application/pdf", as_attachment=True, download_name="Weather_Analysis_Report.pdf")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
`
  },
  {
    path: "backend/config.py",
    name: "config.py",
    language: "python",
    category: "config",
    description: "Environment configuration, database host/credentials, thresholds, and limits",
    content: `import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
SAMPLE_CSV_PATH = BASE_DIR / "sample_weather.csv"
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

PORT = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "weather_analytics_db")

REQUIRED_COLUMNS = ["observation_date", "location", "temperature", "humidity", "rainfall"]
MIN_VALID_TEMPERATURE = -50.0
MAX_VALID_TEMPERATURE = 60.0
MIN_VALID_HUMIDITY = 0.0
MAX_VALID_HUMIDITY = 100.0
MIN_VALID_RAINFALL = 0.0
MAX_VALID_RAINFALL = 1500.0
MAX_CONTENT_LENGTH = 16 * 1024 * 1024
`
  },
  {
    path: "backend/database.py",
    name: "database.py",
    language: "python",
    category: "config",
    description: "MySQL connection manager, parameterized SQL queries, connection fallback, and table initialization",
    content: `"""
MySQL Database Manager with Parameterized SQL Queries & Safe Fallback.
"""

from typing import Tuple, Optional, Dict, Any
import pandas as pd
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

class WeatherDatabase:
    def __init__(self):
        self.is_connected = False
        self.last_error = ""
        self._test_connection()

    def _test_connection(self) -> bool:
        if not MYSQL_AVAILABLE:
            self.last_error = "mysql-connector not installed"
            return False
        try:
            conn = mysql.connector.connect(
                host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, connection_timeout=2
            )
            if conn.is_connected():
                cursor = conn.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS \`{DB_NAME}\`;")
                conn.commit()
                cursor.close()
                conn.close()
                self._initialize_schema()
                self.is_connected = True
                return True
        except Exception as err:
            self.last_error = str(err)
            self.is_connected = False
            return False

    def get_connection(self):
        return mysql.connector.connect(
            host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, database=DB_NAME
        )

    def _initialize_schema(self):
        ddl = """
        CREATE TABLE IF NOT EXISTS weather_records (
            record_id INT AUTO_INCREMENT PRIMARY KEY,
            observation_date DATE NOT NULL,
            location VARCHAR(100) NOT NULL,
            temperature DECIMAL(5,2) NOT NULL,
            humidity DECIMAL(5,2) NOT NULL,
            rainfall DECIMAL(7,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_location (location),
            INDEX idx_date (observation_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(ddl)
        conn.commit()
        cursor.close()
        conn.close()

    def get_status(self) -> Dict[str, Any]:
        self._test_connection()
        return {
            "driver_installed": MYSQL_AVAILABLE,
            "connected": self.is_connected,
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME,
            "mode": "MySQL Database Mode" if self.is_connected else "CSV Demonstration Mode (Standalone)",
            "message": "Connected to MySQL" if self.is_connected else f"Offline ({self.last_error})"
        }

    def insert_records(self, valid_df: pd.DataFrame) -> Tuple[int, Optional[str]]:
        if not self.is_connected or valid_df.empty:
            return 0, "Database offline"
        sql = "INSERT INTO weather_records (observation_date, location, temperature, humidity, rainfall) VALUES (%s, %s, %s, %s, %s)"
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            records = [
                (str(r["observation_date"]), str(r["location"]), float(r["temperature"]), float(r["humidity"]), float(r["rainfall"]))
                for _, r in valid_df.iterrows()
            ]
            cursor.executemany(sql, records)
            conn.commit()
            count = cursor.rowcount
            cursor.close()
            conn.close()
            return count, None
        except Exception as e:
            return 0, str(e)

db_instance = WeatherDatabase()
`
  },
  {
    path: "backend/modules/data_validation.py",
    name: "data_validation.py",
    language: "python",
    category: "module",
    description: "Strict Python validation module auditing missing values, duplicates, dates, and bounds",
    content: `from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
from config import REQUIRED_COLUMNS, MIN_VALID_TEMPERATURE, MAX_VALID_TEMPERATURE, MIN_VALID_HUMIDITY, MAX_VALID_HUMIDITY, MIN_VALID_RAINFALL, MAX_VALID_RAINFALL

def validate_weather_data(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    if df_raw is None or df_raw.empty:
        empty = pd.DataFrame(columns=REQUIRED_COLUMNS)
        return empty, empty.copy(), {"total_records": 0, "accepted_records": 0, "rejected_records": 0}

    df = df_raw.copy()
    total = len(df)
    reasons: List[List[str]] = [[] for _ in range(total)]

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {', '.join(missing_cols)}")

    # Check missing values
    for idx, row in df.iterrows():
        nulls = [c for c in REQUIRED_COLUMNS if pd.isna(row[c]) or str(row[c]).strip() == ""]
        if nulls:
            reasons[idx].append(f"Missing value in: {', '.join(nulls)}")

    # Check duplicates
    pairs = df.apply(lambda r: f"{str(r['observation_date']).strip()}|{str(r['location']).strip().lower()}", axis=1)
    for idx, is_dup in enumerate(pairs.duplicated(keep="first")):
        if is_dup:
            reasons[idx].append("Duplicate observation for date and location")

    # Dates
    parsed_dates = []
    for idx, val in enumerate(df["observation_date"]):
        dt = pd.to_datetime(val, errors="coerce")
        if pd.isna(dt) or dt.year < 1900 or dt.year > 2100:
            reasons[idx].append(f"Invalid date: '{val}'")
            parsed_dates.append(None)
        else:
            parsed_dates.append(dt.strftime("%Y-%m-%d"))

    # Temperatures, humidity, rainfall bounds
    parsed_temps = []
    parsed_hum = []
    parsed_rain = []
    for idx, row in df.iterrows():
        try:
            t = float(row["temperature"])
            if t < MIN_VALID_TEMPERATURE or t > MAX_VALID_TEMPERATURE:
                reasons[idx].append(f"Temperature {t}°C out of range [-50°C to 60°C]")
            parsed_temps.append(t)
        except Exception:
            reasons[idx].append("Non-numeric temperature")
            parsed_temps.append(np.nan)

        try:
            h = float(row["humidity"])
            if h < MIN_VALID_HUMIDITY or h > MAX_VALID_HUMIDITY:
                reasons[idx].append(f"Humidity {h}% out of range [0% to 100%]")
            parsed_hum.append(h)
        except Exception:
            reasons[idx].append("Non-numeric humidity")
            parsed_hum.append(np.nan)

        try:
            r = float(row["rainfall"])
            if r < MIN_VALID_RAINFALL:
                reasons[idx].append(f"Negative rainfall: {r} mm")
            elif r > MAX_VALID_RAINFALL:
                reasons[idx].append(f"Rainfall exceeds cloudburst threshold: {r} mm")
            parsed_rain.append(r)
        except Exception:
            reasons[idx].append("Non-numeric rainfall")
            parsed_rain.append(np.nan)

    df["rejection_reason"] = ["; ".join(r) for r in reasons]
    valid_mask = df["rejection_reason"] == ""

    valid_df = df[valid_mask].copy()
    valid_df["observation_date"] = [parsed_dates[i] for i in valid_df.index]
    valid_df["temperature"] = [parsed_temps[i] for i in valid_df.index]
    valid_df["humidity"] = [parsed_hum[i] for i in valid_df.index]
    valid_df["rainfall"] = [parsed_rain[i] for i in valid_df.index]
    valid_df["location"] = valid_df["location"].astype(str).str.strip().str.title()
    valid_df.drop(columns=["rejection_reason"], inplace=True)
    valid_df.reset_index(drop=True, inplace=True)

    invalid_df = df[~valid_mask].copy()
    invalid_df["row_number"] = [i + 2 for i in invalid_df.index]
    invalid_df.reset_index(drop=True, inplace=True)

    summary = {
        "total_records": total,
        "accepted_records": len(valid_df),
        "rejected_records": len(invalid_df),
        "acceptance_rate_pct": round((len(valid_df) / total * 100), 2) if total > 0 else 0
    }
    return valid_df, invalid_df, summary
`
  },
  {
    path: "render.yaml",
    name: "render.yaml",
    language: "yaml",
    category: "deploy",
    description: "Render infrastructure-as-code specification for Python web service",
    content: `services:
  - type: web
    name: weather-data-analysis-api
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn backend.app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.12
      - key: FLASK_DEBUG
        value: "false"
      - key: CORS_ORIGINS
        value: "*"
`
  },
  {
    path: "vercel.json",
    name: "vercel.json",
    language: "json",
    category: "deploy",
    description: "Vercel deployment configuration for React SPA routing",
    content: `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
`
  },
  {
    path: ".env.example",
    name: ".env.example",
    language: "text",
    category: "config",
    description: "Template for frontend, backend, and MySQL environment variables",
    content: `VITE_API_BASE_URL="/api"
PORT=5000
FLASK_DEBUG=false
CORS_ORIGINS="*"
DB_HOST="localhost"
DB_PORT=3306
DB_USER="root"
DB_PASSWORD="your_mysql_password"
DB_NAME="weather_analytics_db"
`
  },
  {
    path: "README.md",
    name: "README.md",
    language: "markdown",
    category: "doc",
    description: "Comprehensive B.Tech CSE thesis, local VS Code setup, Render/Vercel guide, and testing verification",
    content: `# Weather Data Analysis System
Full-Stack Python Flask + React TypeScript Web Application
`
  }
];
