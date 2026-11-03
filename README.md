# Weather Data Analysis System
**Full-Stack B.Tech Computer Science & Engineering (CSE) Capstone Project**

![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-blue?logo=react)
![Flask](https://img.shields.io/badge/Backend-Python%20Flask-green?logo=flask)
![Pandas](https://img.shields.io/badge/Analytics-Pandas%20%26%20NumPy-navy?logo=pandas)
![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20CSV%20Mode-orange?logo=mysql)
![Excel](https://img.shields.io/badge/Formats-CSV%20%26%20Excel%20.xlsx-darkgreen?logo=microsoftexcel)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-black?logo=vercel)

---

## 1. Project Overview

The **Weather Data Analysis System** is an end-to-end, production-ready full-stack web application designed for historical meteorological observation analysis, empirical quality auditing, vectorized statistical summaries, station comparison, and interactive visualization.

Built for academic B.Tech CSE capstone evaluation, GitHub showcase, and real-world web deployment, the system pairs a reactive **React + TypeScript** web interface with a **Python Flask** REST API and a relational **MySQL** database.

> **CRITICAL SCIENTIFIC PRINCIPLE:**  
> This system is engineered strictly for **Historical Weather Data Analysis**, **NOT** weather forecasting or artificial predictive simulations. All dashboard metrics, tables, and graphs reflect actual ingested empirical data.

---

## 2. Project Team & Academic Credentials

- **Team Members:**
  1. **Nandini**
  2. **Shanthi**
  3. **Mohana Priya**
  4. **Kavya Reddy**
  5. **Haripriya**
  6. **Prasanth**
- **Department:** Computer Science and Engineering (CSE)
- **College:** Mohan Babu University
- **Academic Year:** 2026–2027

---

## 3. Key Capabilities & Features

### 👤 User Registration & Secure Authentication
- Client-side and server-ready authentication with SHA-256 hashed and salted passwords.
- Role-based profiles (Student Researcher, Faculty Evaluator, Meteorological Analyst).
- Pre-configured demo accounts for instant 1-click academic evaluation.
- Individual user dashboards with personalized activity statistics and session management.

### 📁 CSV & Excel Ingestion
- Supports both comma-separated values (`.csv`) and Microsoft Excel (`.xlsx`, `.xls`) workbooks via SheetJS.
- Drag-and-drop file uploader with instant file size, sheet name, and row count preview.
- Dual downloadable sample templates: `sample_weather_template.csv` and `sample_weather_template.xlsx`.

### 🛡️ 7-Point Meteorological Data Quality Engine
- Complete automated audit against 7 physical rules:
  1. Null / Missing value checks
  2. Duplicate row quarantine
  3. ISO calendar date parsing
  4. Numeric coercion
  5. Thermodynamic temperature bounds (-50°C to +60°C)
  6. Atmospheric relative humidity bounds (0% to 100%)
  7. Non-negative precipitation checks (>= 0 mm)
- **Zero Silent Deletion Policy:** Corrupt records are isolated in an audit log with explicit rejection causes.

### 📊 Historical Weather Analysis & Station Comparison
- Aggregated calculations: Mean, minimum, and maximum temperatures, mean humidity, cumulative rainfall, daily swings, and monthly trends.
- Head-to-Head Station Comparison tool with differential margins (Δ Temp, Δ Rain, Δ Humidity).
- Algorithmic weather insights identifying thermal extremes, precipitation peaks, and humidity comfort bands.

### 📑 Multi-Format Report Export
- **Comprehensive Excel Dossier (`.xlsx`):** Multi-sheet workbook with Executive Summary, Cleaned Data, Monthly Trends, Station Comparison, and Audit Log.
- **Formal Academic PDF:** Printable document generated via jsPDF and Python ReportLab.
- **Structured CSVs:** Cleaned observations, monthly aggregations, and data quality rejection logs.

### 📚 Help & User Guide Section
- 4-step quick-start workflow.
- Complete dataset schema specifications.
- Deep dive into the 7 validation integrity rules.
- Frequently asked questions (FAQ) and Viva examination defense cheat sheet.

---

## 4. Technology Stack

| Layer | Technologies Used | Role in System |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide React, HTML5 | Reactive user interface, interactive charts, responsive layout |
| **Backend API** | Python 3.10+, Flask, Flask-CORS | REST API handling validation, file ingestion, statistical routing |
| **Data Processing** | Pandas, NumPy | Vectorized aggregations, temporal extraction, outlier filtering |
| **Excel & Document Engine** | SheetJS (`xlsx`), jsPDF, ReportLab | Excel workbook parsing & export, automated executive PDF compilation |
| **Database** | MySQL Server (`mysql-connector-python`) | Parameterized relational storage with standalone fallback |
| **Deployment** | Vercel (Frontend), Render (Flask Backend) | Production cloud hosting |

---

## 5. Local Setup & Execution Guide (VS Code)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [Git](https://git-scm.com/)
- Visual Studio Code

---

### Step 1: Clone or Open Project
```bash
git clone <repository-url>
cd weather-data-analysis
```

---

### Step 2: Frontend Setup (React + Vite)
```bash
npm install
npm run dev
```
The React frontend starts at **`http://localhost:3000`** with full offline capabilities, demo datasets, Excel parsing, and PDF downloads.

---

### Step 3: Backend Setup (Python Flask)
Open a new terminal window:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # On Linux/macOS
# or: venv\Scripts\activate   # On Windows

# Install Python requirements
pip install -r requirements.txt

# Start Flask backend server
python backend/app.py
```
The Flask REST API will run at **`http://127.0.0.1:5000`**.

---

### Step 4: Optional MySQL Setup
1. Open MySQL workbench or shell:
```sql
CREATE DATABASE IF NOT EXISTS weather_db;
USE weather_db;

CREATE TABLE IF NOT EXISTS weather_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    observation_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    rainfall DECIMAL(6,2) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_station_date (observation_date, location)
);
```
2. Configure credentials in `.env`:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=weather_db
```
*(If MySQL is not installed, the application automatically runs in Standalone CSV/Excel Demonstration Mode with zero configuration!)*

---

## 6. Python REST API Endpoints

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend connectivity, MySQL status, active records count |
| `GET` | `/api/dashboard` | 6 Core metrics, monthly trends, 10 recent observations |
| `POST` | `/api/upload` | Ingests CSV/Excel data, executes validation engine |
| `GET` | `/api/analysis` | Filtered analytics (by location, date range, month, year) |
| `GET` | `/api/records` | Paginated records with search, date filter, and sorting |
| `GET` | `/api/reports/cleaned-csv` | Streams cleaned validated observations as CSV |
| `GET` | `/api/reports/monthly-csv` | Streams monthly aggregated statistics as CSV |
| `GET` | `/api/reports/quality-csv` | Streams data quality rejection audit log as CSV |
| `GET` | `/api/reports/pdf` | Streams compiled formal academic PDF report |

---

## 7. Cloud Deployment Guide

### A. Deploy Backend to Render (Python Flask)
1. Push project to GitHub.
2. Sign in to [Render.com](https://render.com) and create a **New Web Service**.
3. Select your repository.
4. Set configuration:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn backend.app:app`
5. Set environment variable: `CORS_ORIGINS=*`
6. Click **Deploy**. Note your URL (e.g. `https://weather-backend.onrender.com`).

### B. Deploy Frontend to Vercel (React)
1. Sign in to [Vercel.com](https://vercel.com) and select **Add New > Project**.
2. Import your GitHub repository.
3. Framework Preset: `Vite`.
4. Add environment variable:
   - `VITE_API_BASE_URL`: `https://weather-backend.onrender.com/api`
5. Click **Deploy**. Your dashboard will be live online with HTTPS!

---

## 8. Academic Viva Defense Cheat Sheet

- **Q1: Why is this system not doing weather forecasting?**  
  *A: Weather forecasting requires atmospheric fluid dynamics simulation (barometric pressure, wind vectors, Doppler radar) or complex time-series neural networks. This system is an **Exploratory Data Analysis (EDA) and Quality Auditing System** for historical factual observations.*

- **Q2: How does the system handle corrupted readings?**  
  *A: Standard scripts use destructive silent cleaning like `dropna()`. Our validation engine audits records against 7 physical rules, quarantines invalid rows in an audit table, and logs the human-readable rejection reason.*

- **Q3: What makes this project production-ready?**  
  *A: It features responsive design across all devices, multi-sheet Excel and PDF reporting, user authentication with hashed credentials, individual dashboard libraries, parameterized SQL against injection, and graceful offline fallback.*

---
**Developed for B.Tech Computer Science & Engineering Capstone Evaluation • Mohan Babu University (2026–2027)**
