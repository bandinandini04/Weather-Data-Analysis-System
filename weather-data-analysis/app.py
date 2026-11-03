"""
Weather Data Analysis System
B.Tech CSE Project • Streamlit Web Application
Analyzes Historical Meteorological Observations with Python, Pandas, NumPy, Plotly, and MySQL.
"""

import os
import io
from pathlib import Path
import streamlit as st
import pandas as pd
import numpy as np

# Configure Streamlit page layout and title
st.set_page_config(
    page_title="Weather Data Analysis System",
    page_icon="⛅",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Import internal modular components
from config import (
    APP_TITLE,
    APP_SUBTITLE,
    COLLEGE_PROJECT_LABEL,
    SAMPLE_CSV_PATH,
    REQUIRED_COLUMNS
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
from modules.visualization import (
    plot_monthly_avg_temperature,
    plot_monthly_rainfall,
    plot_monthly_avg_humidity,
    plot_temperature_comparison,
    plot_daily_temperature_trends
)
from modules.report_generation import dataframe_to_csv_bytes, generate_pdf_summary_report

# Custom CSS for Modern Blue & White Meteorological Dashboard
st.markdown("""
<style>
    /* Global Color Theme */
    :root {
        --primary: #0284c7;
        --primary-dark: #0369a1;
        --primary-light: #e0f2fe;
        --accent: #38bdf8;
        --card-bg: #ffffff;
        --text-main: #0f172a;
        --text-muted: #64748b;
    }
    
    /* Header typography */
    .app-header {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        padding: 1.5rem 2rem;
        border-radius: 12px;
        color: white;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 15px rgba(2, 132, 199, 0.15);
    }
    .app-header h1 {
        color: white !important;
        font-size: 2.1rem;
        font-weight: 700;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .app-header p {
        color: #e0f2fe !important;
        font-size: 1.05rem;
        margin-top: 0.35rem;
        margin-bottom: 0;
    }
    .badge-btech {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 0.5rem;
        backdrop-filter: blur(4px);
    }

    /* Metric Card Styling */
    .stat-card {
        background: white;
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        margin-bottom: 1rem;
    }
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 14px rgba(2, 132, 199, 0.08);
        border-color: #bae6fd;
    }
    .stat-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.4rem;
    }
    .stat-val {
        font-size: 1.85rem;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.1;
    }
    .stat-unit {
        font-size: 0.95rem;
        color: #0284c7;
        font-weight: 600;
        margin-left: 2px;
    }
    .stat-sub {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 0.35rem;
    }

    /* Database Mode Badge */
    .db-status-bar {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    /* Styled notification boxes */
    .info-callout {
        background-color: #f0f9ff;
        border-left: 4px solid #0284c7;
        padding: 1rem 1.25rem;
        border-radius: 0 8px 8px 0;
        margin: 1rem 0;
        color: #0369a1;
    }
</style>
""", unsafe_allow_html=True)


# Initialize Session State
if "raw_df" not in st.session_state:
    st.session_state.raw_df = None
if "valid_df" not in st.session_state:
    st.session_state.valid_df = None
if "invalid_df" not in st.session_state:
    st.session_state.invalid_df = None
if "validation_summary" not in st.session_state:
    st.session_state.validation_summary = {}
if "processed_df" not in st.session_state:
    st.session_state.processed_df = None
if "dataset_source_name" not in st.session_state:
    st.session_state.dataset_source_name = "None"


def load_dataset(df_input: pd.DataFrame, source_name: str):
    """Validates and updates session state with a newly provided DataFrame."""
    try:
        valid_df, invalid_df, summary = validate_weather_data(df_input)
        processed = process_weather_data(valid_df)

        st.session_state.raw_df = df_input
        st.session_state.valid_df = valid_df
        st.session_state.invalid_df = invalid_df
        st.session_state.validation_summary = summary
        st.session_state.processed_df = processed
        st.session_state.dataset_source_name = source_name
        return True, None
    except Exception as e:
        return False, str(e)


# Preload sample dataset automatically if no dataset is active
if st.session_state.raw_df is None and os.path.exists(SAMPLE_CSV_PATH):
    try:
        init_sample = pd.read_csv(SAMPLE_CSV_PATH)
        load_dataset(init_sample, "sample_weather.csv (Automatic Demo Load)")
    except Exception:
        pass


# Sidebar Navigation
with st.sidebar:
    st.markdown(f"<div class='badge-btech'>{COLLEGE_PROJECT_LABEL}</div>", unsafe_allow_html=True)
    st.title("⛅ Weather Analytics")
    st.caption("Historical Meteorological Intelligence")
    st.divider()

    menu_option = st.radio(
        "Navigation Menu",
        [
            "Dashboard",
            "Upload Weather Data",
            "Data Analysis",
            "Data Visualization",
            "Weather Records",
            "Reports",
            "About Project"
        ],
        index=0
    )

    st.divider()

    # Database Status Indicator in Sidebar
    db_status = db_instance.get_status()
    if db_status["connected"]:
        st.success(f"🟢 **MySQL Mode Active**\n\nConnected: `{db_status['database']}`")
    else:
        st.info(f"🟡 **CSV Demonstration Mode**\n\n*(Standalone: MySQL optional)*")

    # Active dataset status badge
    if st.session_state.valid_df is not None:
        st.caption(f"📁 **Active Dataset:** {st.session_state.dataset_source_name}")
        st.caption(f"📊 Valid Records: **{len(st.session_state.valid_df):,}** | Invalid: **{len(st.session_state.invalid_df):,}**")
    else:
        st.caption("⚠️ No dataset loaded currently.")


# Top Banner Component
st.markdown(f"""
<div class="app-header">
    <div class="badge-btech">{COLLEGE_PROJECT_LABEL}</div>
    <h1>{APP_TITLE}</h1>
    <p>{APP_SUBTITLE}</p>
</div>
""", unsafe_allow_html=True)


# ==========================================
# PAGE 1: DASHBOARD
# ==========================================
if menu_option == "Dashboard":
    st.subheader("📊 Executive Meteorological Dashboard")

    if st.session_state.valid_df is None or st.session_state.valid_df.empty:
        st.warning("⚠️ No weather dataset is currently uploaded or loaded.")
        st.markdown("""
        Please navigate to **Upload Weather Data** in the sidebar to upload a CSV file, or click below to load the built-in historical demonstration dataset.
        """)
        if st.button("🚀 Load Sample Weather Dataset (365+ Observations)", type="primary"):
            if os.path.exists(SAMPLE_CSV_PATH):
                sample_data = pd.read_csv(SAMPLE_CSV_PATH)
                success, err = load_dataset(sample_data, "sample_weather.csv")
                if success:
                    st.success("Sample weather observations loaded and validated successfully!")
                    st.rerun()
                else:
                    st.error(f"Error validating sample data: {err}")
    else:
        valid_df = st.session_state.valid_df
        invalid_df = st.session_state.invalid_df
        val_summary = st.session_state.validation_summary
        stats = compute_overall_statistics(valid_df)

        # 6 Core Metric Cards
        c1, c2, c3, c4, c5, c6 = st.columns(6)

        with c1:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Total Records</div>
                <div class="stat-val">{val_summary.get('total_records', 0):,}</div>
                <div class="stat-sub">Raw observations</div>
            </div>
            """, unsafe_allow_html=True)

        with c2:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Avg Temperature</div>
                <div class="stat-val">{stats.get('avg_temp', 0):.1f}<span class="stat-unit">°C</span></div>
                <div class="stat-sub">Range: {stats.get('min_temp', 0):.1f}° to {stats.get('max_temp', 0):.1f}°</div>
            </div>
            """, unsafe_allow_html=True)

        with c3:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Avg Humidity</div>
                <div class="stat-val">{stats.get('avg_humidity', 0):.1f}<span class="stat-unit">%</span></div>
                <div class="stat-sub">Range: {stats.get('min_humidity', 0):.1f}% to {stats.get('max_humidity', 0):.1f}%</div>
            </div>
            """, unsafe_allow_html=True)

        with c4:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Total Rainfall</div>
                <div class="stat-val">{stats.get('total_rainfall', 0):.1f}<span class="stat-unit">mm</span></div>
                <div class="stat-sub">Peak day: {stats.get('max_rainfall', 0):.1f} mm</div>
            </div>
            """, unsafe_allow_html=True)

        with c5:
            st.markdown(f"""
            <div class="stat-card" style="border-left: 4px solid #10b981;">
                <div class="stat-label">Valid Records</div>
                <div class="stat-val" style="color: #059669;">{val_summary.get('accepted_records', 0):,}</div>
                <div class="stat-sub">Quality: {val_summary.get('acceptance_rate_pct', 0)}% passed</div>
            </div>
            """, unsafe_allow_html=True)

        with c6:
            st.markdown(f"""
            <div class="stat-card" style="border-left: 4px solid #ef4444;">
                <div class="stat-label">Invalid Records</div>
                <div class="stat-val" style="color: #dc2626;">{val_summary.get('rejected_records', 0):,}</div>
                <div class="stat-sub">Audited & isolated</div>
            </div>
            """, unsafe_allow_html=True)

        # Visual charts grid
        ch_col1, ch_col2 = st.columns(2)
        processed_df = st.session_state.processed_df
        monthly_df = compute_monthly_analysis(processed_df)

        with ch_col1:
            st.plotly_chart(plot_monthly_avg_temperature(monthly_df), use_container_width=True)

        with ch_col2:
            st.plotly_chart(plot_monthly_rainfall(monthly_df), use_container_width=True)

        # Humidity chart full width
        st.plotly_chart(plot_monthly_avg_humidity(monthly_df), use_container_width=True)

        # Recent Weather Records Table
        st.subheader("📋 Recent Weather Records")
        st.caption("Latest recorded meteorological observations from the validated dataset.")
        display_recent = valid_df.sort_values(by="observation_date", ascending=False).head(10)
        st.dataframe(
            display_recent[["observation_date", "location", "temperature", "humidity", "rainfall"]],
            use_container_width=True,
            column_config={
                "observation_date": "Observation Date",
                "location": "Location / Station",
                "temperature": st.column_config.NumberColumn("Temperature (°C)", format="%.1f °C"),
                "humidity": st.column_config.NumberColumn("Humidity (%)", format="%.1f %%"),
                "rainfall": st.column_config.NumberColumn("Rainfall (mm)", format="%.1f mm")
            }
        )


# ==========================================
# PAGE 2: UPLOAD WEATHER DATA
# ==========================================
elif menu_option == "Upload Weather Data":
    st.subheader("📁 Upload Weather Observation Dataset")
    st.markdown("""
    Upload a historical weather dataset in **CSV format**.
    The system verifies schema structure, audits mathematical bounds, and separates valid observations from malformed records.
    """)

    up_col1, up_col2 = st.columns([2, 1])

    with up_col1:
        uploaded_file = st.file_uploader(
            "Choose a CSV file",
            type=["csv"],
            help="File must contain: observation_date, location, temperature, humidity, rainfall"
        )

        if uploaded_file is not None:
            filename = uploaded_file.name
            st.info(f"📄 **Uploaded File:** `{filename}` ({uploaded_file.size / 1024:.1f} KB)")

            try:
                raw_input_df = pd.read_csv(uploaded_file)
                st.write(f"**Total Ingested Rows:** {len(raw_input_df):,}")

                # Preview Raw Dataset
                with st.expander("👁️ Raw Dataset Preview (First 5 Rows)", expanded=True):
                    st.dataframe(raw_input_df.head(5), use_container_width=True)

                if st.button("🔍 Run Python Data Validation Engine", type="primary"):
                    success, error = load_dataset(raw_input_df, filename)
                    if success:
                        st.success("✅ Dataset successfully validated and loaded into active analytics state!")
                        st.balloons()
                    else:
                        st.error(f"❌ Validation failed: {error}")

            except Exception as e:
                st.error(f"Failed to read CSV: {str(e)}")

    with up_col2:
        st.markdown("""
        ### 📋 Mandatory CSV Columns
        Your dataset must include these headers:
        1. `observation_date` *(YYYY-MM-DD)*
        2. `location` *(City or Station)*
        3. `temperature` *(Celsius, -50°C to 60°C)*
        4. `humidity` *(Relative %, 0 to 100%)*
        5. `rainfall` *(Precipitation in mm, >= 0)*
        """)

        # Download Template CSV
        sample_template_df = pd.DataFrame({
            "observation_date": ["2024-01-01", "2024-01-02", "2024-01-03"],
            "location": ["Mumbai", "New Delhi", "Bengaluru"],
            "temperature": [28.5, 14.2, 22.0],
            "humidity": [65.0, 78.0, 52.0],
            "rainfall": [0.0, 2.5, 0.0]
        })
        csv_template_bytes = dataframe_to_csv_bytes(sample_template_df)
        st.download_button(
            label="📥 Download Sample CSV Template",
            data=csv_template_bytes,
            file_name="weather_template.csv",
            mime="text/csv",
            use_container_width=True
        )

        st.divider()
        st.markdown("### 🧪 Quick Demonstration")
        if st.button("Load Built-in Sample Dataset", use_container_width=True):
            if os.path.exists(SAMPLE_CSV_PATH):
                sample_data = pd.read_csv(SAMPLE_CSV_PATH)
                load_dataset(sample_data, "sample_weather.csv")
                st.success("Loaded built-in historical demonstration dataset!")
                st.rerun()

    # Preprocessing & Audit Results Display
    if st.session_state.validation_summary:
        st.divider()
        st.subheader("🛡️ Preprocessing & Validation Audit Summary")
        v = st.session_state.validation_summary

        r1, r2, r3, r4, r5 = st.columns(5)
        r1.metric("Total Rows", f"{v.get('total_records', 0):,}")
        r2.metric("Accepted Records", f"{v.get('accepted_records', 0):,}")
        r3.metric("Rejected Records", f"{v.get('rejected_records', 0):,}")
        r4.metric("Missing Values Found", f"{v.get('missing_values_count', 0)}")
        r5.metric("Duplicates Isolated", f"{v.get('duplicates_count', 0)}")

        r6, r7, r8, r9 = st.columns(4)
        r6.metric("Invalid Dates", f"{v.get('invalid_dates_count', 0)}")
        r7.metric("Non-Numeric Values", f"{v.get('non_numeric_count', 0)}")
        r8.metric("Temperature Out-of-Bounds", f"{v.get('out_of_range_temp_count', 0)}")
        r9.metric("Negative / Spurious Rain", f"{v.get('negative_rainfall_count', 0)}")

        if not st.session_state.invalid_df.empty:
            st.warning("⚠️ **Isolated Invalid Records with Explicit Rejection Reasons:**")
            st.dataframe(
                st.session_state.invalid_df,
                use_container_width=True
            )


# ==========================================
# PAGE 3: DATA ANALYSIS
# ==========================================
elif menu_option == "Data Analysis":
    st.subheader("🔬 Comprehensive Weather Data Analysis")

    if st.session_state.processed_df is None or st.session_state.processed_df.empty:
        st.warning("Please upload or load a weather dataset first from the Dashboard or Upload page.")
    else:
        df = st.session_state.processed_df

        # Filter Section
        with st.expander("🔍 Interactive Query Filters", expanded=True):
            f_col1, f_col2, f_col3, f_col4 = st.columns(4)

            all_locations = sorted(df["location"].unique().tolist())
            selected_locations = f_col1.multiselect("Select Locations", all_locations, default=all_locations)

            min_d = df["date_dt"].min().date()
            max_d = df["date_dt"].max().date()
            date_range = f_col2.date_input("Date Range", value=(min_d, max_d), min_value=min_d, max_value=max_d)

            all_months = sorted(df["month"].unique().tolist())
            month_names = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
            selected_months = f_col3.multiselect("Select Months", all_months, default=all_months, format_func=lambda m: month_names.get(m, str(m)))

            all_years = sorted(df["year"].unique().tolist())
            selected_years = f_col4.multiselect("Select Years", all_years, default=all_years)

        # Apply filtering
        start_d_str = str(date_range[0]) if isinstance(date_range, (list, tuple)) and len(date_range) > 0 else None
        end_d_str = str(date_range[1]) if isinstance(date_range, (list, tuple)) and len(date_range) > 1 else None

        filtered_df = filter_weather_data(
            df,
            locations=selected_locations if selected_locations else None,
            start_date=start_d_str,
            end_date=end_d_str,
            months=selected_months if selected_months else None,
            years=selected_years if selected_years else None
        )

        st.caption(f"Filtered records: **{len(filtered_df):,}** of {len(df):,} total")

        if filtered_df.empty:
            st.error("No records match the selected filter combination.")
        else:
            stats = compute_overall_statistics(filtered_df)

            # 3 Structured Analysis Cards
            t_col, h_col, r_col = st.columns(3)

            with t_col:
                st.markdown("""
                <div class="stat-card" style="border-top: 4px solid #f97316;">
                    <h4 style="margin: 0; color: #ea580c;">🌡️ Temperature Analysis</h4>
                    <hr style="margin: 0.5rem 0;">
                """, unsafe_allow_html=True)
                st.metric("Average Temperature", f"{stats['avg_temp']:.2f} °C")
                st.metric("Minimum Temperature", f"{stats['min_temp']:.2f} °C")
                st.metric("Maximum Temperature", f"{stats['max_temp']:.2f} °C")
                st.markdown("</div>", unsafe_allow_html=True)

            with h_col:
                st.markdown("""
                <div class="stat-card" style="border-top: 4px solid #0284c7;">
                    <h4 style="margin: 0; color: #0284c7;">💧 Humidity Analysis</h4>
                    <hr style="margin: 0.5rem 0;">
                """, unsafe_allow_html=True)
                st.metric("Average Humidity", f"{stats['avg_humidity']:.2f} %")
                st.metric("Minimum Humidity", f"{stats['min_humidity']:.2f} %")
                st.metric("Maximum Humidity", f"{stats['max_humidity']:.2f} %")
                st.markdown("</div>", unsafe_allow_html=True)

            with r_col:
                st.markdown("""
                <div class="stat-card" style="border-top: 4px solid #0ea5e9;">
                    <h4 style="margin: 0; color: #0284c7;">🌧️ Rainfall Analysis</h4>
                    <hr style="margin: 0.5rem 0;">
                """, unsafe_allow_html=True)
                st.metric("Total Rainfall", f"{stats['total_rainfall']:.2f} mm")
                st.metric("Average Daily Rainfall", f"{stats['avg_rainfall']:.2f} mm")
                st.metric("Maximum Single-Day Rain", f"{stats['max_rainfall']:.2f} mm")
                st.markdown("</div>", unsafe_allow_html=True)

            # Tabbed detailed breakdown
            t1, t2, t3 = st.tabs(["📅 Monthly Analysis Aggregation", "📆 Daily Analysis Timeline", "📍 Location-wise Statistics"])

            with t1:
                monthly_stats = compute_monthly_analysis(filtered_df)
                st.dataframe(monthly_stats, use_container_width=True)

            with t2:
                daily_stats = compute_daily_analysis(filtered_df)
                st.dataframe(daily_stats, use_container_width=True)

            with t3:
                loc_stats = compute_location_analysis(filtered_df)
                st.dataframe(loc_stats, use_container_width=True)


# ==========================================
# PAGE 4: DATA VISUALIZATION
# ==========================================
elif menu_option == "Data Visualization":
    st.subheader("📈 Interactive Meteorological Visualizations")

    if st.session_state.processed_df is None or st.session_state.processed_df.empty:
        st.warning("Please upload or load a weather dataset first.")
    else:
        df = st.session_state.processed_df

        # Location filter for charts
        locations = sorted(df["location"].unique().tolist())
        selected_loc = st.multiselect("Filter Chart Data by Location", locations, default=locations)

        filtered_vis = df[df["location"].isin(selected_loc)] if selected_loc else df
        monthly_df = compute_monthly_analysis(filtered_vis)
        daily_df = compute_daily_analysis(filtered_vis)
        location_df = compute_location_analysis(filtered_vis)

        # 1. Monthly Average Temperature
        st.markdown("#### 1. Monthly Average Temperature (°C)")
        st.caption("Line chart highlighting mean, minimum, and maximum seasonal temperature variations.")
        st.plotly_chart(plot_monthly_avg_temperature(monthly_df), use_container_width=True)

        # 2. Monthly Rainfall
        st.markdown("#### 2. Monthly Rainfall (mm)")
        st.caption("Bar chart tracking total monthly precipitation with volumetric gradient.")
        st.plotly_chart(plot_monthly_rainfall(monthly_df), use_container_width=True)

        # 3. Monthly Average Humidity
        st.markdown("#### 3. Monthly Average Humidity (%)")
        st.caption("Relative atmospheric humidity trends with shaded boundary area.")
        st.plotly_chart(plot_monthly_avg_humidity(monthly_df), use_container_width=True)

        # 4. Temperature Comparison across locations
        st.markdown("#### 4. Temperature Comparison Across Stations")
        st.caption("Grouped bar chart comparing minimum, average, and maximum temperatures.")
        st.plotly_chart(plot_temperature_comparison(location_df), use_container_width=True)

        # 5. Daily Temperature Trends
        st.markdown("#### 5. Daily Temperature Trends (Chronological Timeline)")
        st.caption("High-resolution chronological record of daily temperatures.")
        st.plotly_chart(plot_daily_temperature_trends(daily_df), use_container_width=True)


# ==========================================
# PAGE 5: WEATHER RECORDS
# ==========================================
elif menu_option == "Weather Records":
    st.subheader("🗄️ Weather Dataset Records Explorer")

    if st.session_state.valid_df is None:
        st.warning("Please load or upload a weather dataset first.")
    else:
        rec_tabs = st.tabs(["✅ Validated Weather Records", "❌ Audited Invalid Records", "🗄️ MySQL Database Table"])

        with rec_tabs[0]:
            df_valid = st.session_state.valid_df.copy()

            s_col1, s_col2, s_col3 = st.columns([2, 2, 1])
            search_query = s_col1.text_input("🔍 Search by Location", placeholder="e.g. Mumbai, Delhi")
            sort_by = s_col2.selectbox("Sort By Column", ["observation_date", "temperature", "humidity", "rainfall", "location"])
            sort_asc = s_col3.radio("Order", ["Ascending", "Descending"], horizontal=True) == "Ascending"

            # Filter search
            if search_query:
                df_valid = df_valid[df_valid["location"].str.contains(search_query, case=False, na=False)]

            df_valid = df_valid.sort_values(by=sort_by, ascending=sort_asc)

            # Pagination
            page_size = 20
            total_pages = max(1, int(np.ceil(len(df_valid) / page_size)))
            page_num = st.number_input("Page", min_value=1, max_value=total_pages, value=1)
            start_idx = (page_num - 1) * page_size
            end_idx = start_idx + page_size

            st.caption(f"Showing rows {start_idx+1} to {min(end_idx, len(df_valid))} of {len(df_valid):,} records")
            st.dataframe(df_valid.iloc[start_idx:end_idx], use_container_width=True)

        with rec_tabs[1]:
            df_invalid = st.session_state.invalid_df
            st.markdown(f"**Total Isolated Malformed Records:** {len(df_invalid)}")
            if df_invalid.empty:
                st.success("🎉 No invalid records found in this dataset!")
            else:
                st.dataframe(df_invalid, use_container_width=True)

        with rec_tabs[2]:
            st.markdown("#### MySQL Table: `weather_records`")
            db_stat = db_instance.get_status()
            st.json(db_stat)

            if db_stat["connected"]:
                if st.button("💾 Sync Validated Records to MySQL"):
                    rows, err = db_instance.insert_records(st.session_state.valid_df)
                    if err:
                        st.error(err)
                    else:
                        st.success(f"Inserted {rows} rows into MySQL database!")

                db_rows, q_err = db_instance.fetch_records(limit=100)
                if not db_rows.empty:
                    st.dataframe(db_rows, use_container_width=True)
            else:
                st.info("Operating in standalone demonstration mode. To enable persistent MySQL storage, configure DB_HOST, DB_USER, and DB_PASSWORD in your .env file or environment.")


# ==========================================
# PAGE 6: REPORTS & DOWNLOADS
# ==========================================
elif menu_option == "Reports":
    st.subheader("📑 Meteorological Reports & Data Export")
    st.markdown("""
    Generate and download reports in **CSV** or **PDF format** for academic evaluation, documentation, and archival.
    """)

    if st.session_state.valid_df is None or st.session_state.valid_df.empty:
        st.warning("Please upload or load a dataset first.")
    else:
        valid_df = st.session_state.valid_df
        invalid_df = st.session_state.invalid_df
        processed = st.session_state.processed_df
        monthly_df = compute_monthly_analysis(processed)
        location_df = compute_location_analysis(processed)
        val_summary = st.session_state.validation_summary
        stats = compute_overall_statistics(valid_df)

        col_a, col_b = st.columns(2)

        with col_a:
            st.markdown("### 📥 CSV Data Exports")

            # 1. Cleaned Valid Dataset
            st.download_button(
                label="📄 Download Cleaned Weather Data (CSV)",
                data=dataframe_to_csv_bytes(valid_df),
                file_name="cleaned_weather_data.csv",
                mime="text/csv",
                use_container_width=True
            )

            # 2. Monthly Summary CSV
            st.download_button(
                label="📊 Download Monthly Analysis (CSV)",
                data=dataframe_to_csv_bytes(monthly_df),
                file_name="monthly_weather_analysis.csv",
                mime="text/csv",
                use_container_width=True
            )

            # 3. Data Quality & Rejection Log CSV
            st.download_button(
                label="🛡️ Download Data Quality Audit Log (CSV)",
                data=dataframe_to_csv_bytes(invalid_df) if not invalid_df.empty else b"No invalid records.",
                file_name="data_quality_audit_log.csv",
                mime="text/csv",
                use_container_width=True
            )

        with col_b:
            st.markdown("### 📑 Executive PDF Report")
            st.markdown("""
            Generate a formatted **PDF Report** with Project metadata, statistical tables, monthly summaries, and data quality logs.
            """)

            pdf_bytes = generate_pdf_summary_report(
                summary_stats=stats,
                monthly_df=monthly_df,
                validation_summary=val_summary,
                dataset_name=st.session_state.dataset_source_name
            )

            st.download_button(
                label="📕 Download Weather Analysis Executive Report (PDF)",
                data=pdf_bytes,
                file_name="Weather_Analysis_Report.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True
            )


# ==========================================
# PAGE 7: ABOUT PROJECT
# ==========================================
elif menu_option == "About Project":
    st.subheader("ℹ️ About Weather Data Analysis System")

    st.markdown(f"""
    ### Project Overview
    **Project Name:** Weather Data Analysis System  
    **Academic Level:** B.Tech Computer Science & Engineering (CSE)  
    **Purpose:** Automated Historical Weather Data Analysis & Meteorological Quality Audit

    ---

    ### 🎯 Objectives
    1. **Automate Weather Data Analysis:** Ingest real-world weather station CSV records and perform instantaneous aggregations.
    2. **Eliminate Manual Calculations:** Compute minimum, maximum, and average values for temperature, humidity, and rainfall using vector-accelerated NumPy and Pandas algorithms.
    3. **Historical Pattern Identification:** Observe seasonal trends, monsoon spikes, and station comparisons across months and years.
    4. **Improve Data Quality:** Filter out incomplete, duplicate, unparseable, or physically impossible observations without silent deletion.
    5. **Present Information Through Charts & Reports:** Render high-definition interactive Plotly charts and export ready-to-submit PDF/CSV reports.

    ---

    ### 🛠️ Technology Stack
    - **Language:** Python 3.10+
    - **Web Framework:** Streamlit (Reactive Python Web UI)
    - **Data Manipulation:** Pandas & NumPy
    - **Data Visualization:** Plotly & Matplotlib
    - **Relational Storage:** MySQL with `mysql-connector-python`
    - **Report Engine:** ReportLab (Document Automation)
    - **Temporal Parsing:** Python `datetime` module

    ---

    ### 📐 System Architecture Flow
    ```
    [ Weather CSV Dataset ]
              │
              ▼
    [ Python Validation Engine (modules/data_validation.py) ]
         ├── Missing Values Check
         ├── Duplicate Detection (date + location)
         ├── Date Parsing & Bounds Check
         └── Range Verification (-50°C to 60°C, 0-100% Humidity, >=0 Rain)
              │
              ├───────────────┐
              ▼               ▼
      [ Valid Records ]   [ Invalid Records Table + Rejection Reasons ]
              │
              ▼
    [ MySQL Database (`weather_records`) / CSV Mode ]
              │
              ▼
    [ Statistical Computation & Aggregation (modules/weather_analysis.py) ]
              │
              ▼
    [ Interactive Plotly Visualizations & PDF Reports ]
    ```

    ---

    ### 👨‍💻 College Demonstration Guidelines
    - **Dataset Independence:** This system performs analysis purely based on uploaded CSV data. No hardcoded or fictitious sample values are injected.
    - **Transparency:** Rejected records are clearly displayed with the specific reasons (e.g. *"Temperature -85°C out of realistic range"*).
    - **Reproducibility:** Run `pip install -r requirements.txt` followed by `streamlit run app.py` to reproduce the exact experience on any machine.
    """)
