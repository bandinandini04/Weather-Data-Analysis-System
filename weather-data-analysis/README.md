# Weather Data Analysis System
**B.Tech Computer Science and Engineering (CSE) Capstone / Academic Project**

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Streamlit](https://img.shields.io/badge/Streamlit-1.35%2B-red?logo=streamlit)
![Pandas](https://img.shields.io/badge/Pandas-2.2-navy?logo=pandas)
![Plotly](https://img.shields.io/badge/Plotly-5.22-teal?logo=plotly)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange?logo=mysql)

---

## 1. Project Overview
The **Weather Data Analysis System** is an end-to-end Python web application architected to analyze, validate, pre-process, and visualize historical meteorological observation datasets. 

Designed for academic demonstrations and real-world environmental auditing, the system eliminates manual computation by providing automated statistical derivations (mean, minimum, maximum, cumulative precipitation), robust validation filters for bad data, high-resolution interactive charts, and publication-ready CSV and PDF executive reports.

> **CRITICAL ARCHITECTURAL PRINCIPLE:**  
> This system is built strictly for **Historical Weather Data Analysis**, **NOT** weather forecasting or predictive simulation. All analytics reflect genuine data ingested through CSV or MySQL.

---

## 2. Key Features

- **Strict Python Data Validation Engine (`modules/data_validation.py`):**
  - Detects null/missing fields across mandatory columns.
  - Flags duplicate observations on identical date-location tuples.
  - Audits date syntax and bounds (1900–2100).
  - Enforces physical atmospheric constraints:
    - Temperature: `-50.0°C` to `60.0°C`
    - Relative Humidity: `0.0%` to `100.0%`
    - Rainfall: Non-negative (`>= 0.0 mm`) and plausible bounds (`<= 1500 mm`)
  - **Zero Silent Data Deletion:** Isolates rejected records into an Audited Rejection Table with line-by-line explanation strings.

- **Dynamic Interactive Dashboard:**
  - Aggregates actual uploaded numbers for Total Records, Avg Temperature, Avg Humidity, Total Rainfall, Valid Records, and Invalid Records.
  - Interactive temperature, precipitation, and humidity graphs.
  - Recent observation ledger.

- **Multi-Criteria Weather Analysis:**
  - Location multi-select.
  - Temporal range selector (start date to end date).
  - Seasonal month and year filters.
  - Daily, monthly, and location-wise grouping.

- **Interactive Plotly Visualizations:**
  1. *Monthly Average Temperature* – Multi-line series (Mean, Min, Max)
  2. *Monthly Rainfall* – Gradient bar chart with precipitation totals
  3. *Monthly Average Humidity* – Spline line chart with atmospheric fill
  4. *Station Temperature Comparison* – Grouped comparative bar chart
  5. *Daily Temperature Timeline* – Chronological time-series chart

- **Relational MySQL Integration:**
  - DDL schema initialization for `weather_records`.
  - Batch insertion using prepared statements.
  - Automatic fallback to **CSV Demonstration Mode** when MySQL credentials are not configured.

- **Multi-Format Reporting:**
  - Cleaned valid observations (CSV).
  - Monthly statistical summary (CSV).
  - Quality audit & rejection logs (CSV).
  - Executive Meteorological Report (PDF using ReportLab).

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Language** | Python 3.10+ | Core analytical programming language |
| **Web Interface** | Streamlit | Reactive web application layout & widgets |
| **Data Processing** | Pandas & NumPy | High-performance dataframe manipulation & vector calculations |
| **Data Visualization** | Plotly & Matplotlib | Interactive and publication-quality scientific charts |
| **Relational Database** | MySQL | Persistent observation storage |
| **Database Connector** | `mysql-connector-python` | Python MySQL driver |
| **Document Generation**| ReportLab | Automated PDF executive report compilation |
| **Temporal Parsing** | Python `datetime` | Date parsing, extraction, and formatting |

---

## 4. Project Folder Structure

```
weather-data-analysis/
├── app.py                      # Main Streamlit web application & routing
├── requirements.txt            # Python dependencies
├── README.md                   # Comprehensive project documentation
├── .gitignore                  # Git ignore rules
├── .env.example                # Sample database configuration
├── config.py                   # Central settings, thresholds, and paths
├── database.py                 # MySQL connectivity, DDL schema, and fallback
├── sample_weather.csv          # Realistic historical dataset with audit edge cases
└── modules/
    ├── data_validation.py      # Python data validation rules & rejection logging
    ├── data_processing.py      # Feature extraction (year, month, day) & filtering
    ├── weather_analysis.py     # Mathematical aggregations & statistical summaries
    ├── visualization.py        # Interactive Plotly chart builders
    └── report_generation.py    # CSV & PDF export generators
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Python 3.10 or higher installed.
- (Optional) MySQL Server 8.0+ running locally or in Docker.

### Step 1: Clone or Navigate to the Directory
```bash
cd weather-data-analysis
```

### Step 2: Create and Activate Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Database (Optional)
If you wish to use MySQL:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=weather_analytics_db
   ```
*Note: If MySQL is not running, the application seamlessly runs in standalone **CSV Demonstration Mode** without crashing.*

### Step 5: Launch the Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 6. MySQL Database Schema

The system automatically creates the database and table upon first connection:

```sql
CREATE DATABASE IF NOT EXISTS `weather_analytics_db`;
USE `weather_analytics_db`;

CREATE TABLE IF NOT EXISTS `weather_records` (
    `record_id` INT AUTO_INCREMENT PRIMARY KEY,
    `observation_date` DATE NOT NULL,
    `location` VARCHAR(100) NOT NULL,
    `temperature` DECIMAL(5,2) NOT NULL,
    `humidity` DECIMAL(5,2) NOT NULL,
    `rainfall` DECIMAL(7,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_location` (`location`),
    INDEX `idx_date` (`observation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 7. Sample CSV Structure

CSV files uploaded to the system must contain these 5 headers:

```csv
observation_date,location,temperature,humidity,rainfall
2023-01-01,Mumbai,25.4,62.0,0.0
2023-01-01,New Delhi,12.8,78.0,0.0
2023-01-01,Bengaluru,21.3,55.0,0.0
2023-01-01,Chennai,26.5,72.0,0.0
2023-01-01,Shimla,4.2,60.0,0.0
```

---

## 8. College Viva / Technical Demonstration Q&A

**Q1: Why is this project not doing weather forecasting?**  
*A: Forecasting requires predictive modeling (e.g. ARIMA, LSTMs, numerical weather prediction) and atmospheric pressure/wind fields. This project is dedicated to **historical empirical data validation and exploratory data analysis (EDA)**, ensuring data integrity, statistical reporting, and quality auditing.*

**Q2: How does the application handle invalid or corrupted rows?**  
*A: Unlike standard cleaning scripts that silently discard rows with `dropna()`, our validation module audits each record against 7 strict tests, isolates invalid rows in a separate dataframe, and attaches a human-readable `rejection_reason` for each failure.*

**Q3: How does the app operate if MySQL is not installed on the evaluator's computer?**  
*A: It includes a fault-tolerant database wrapper in `database.py`. If the MySQL port cannot be reached, the app cleanly falls back to CSV Demonstration Mode while maintaining full analytical capability.*

---
**Developed for B.Tech Computer Science & Engineering Capstone Evaluation.**
