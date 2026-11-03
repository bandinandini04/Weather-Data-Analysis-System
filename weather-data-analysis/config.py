"""
Configuration module for Weather Data Analysis System.
Loads environment variables and sets global thresholds for data validation and database storage.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR
SAMPLE_CSV_PATH = BASE_DIR / "sample_weather.csv"

# Load .env if present
load_dotenv(BASE_DIR / ".env")

# Database Configuration (MySQL)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "weather_analytics_db")

# Required CSV Columns
REQUIRED_COLUMNS = [
    "observation_date",
    "location",
    "temperature",
    "humidity",
    "rainfall"
]

# Physical and Statistical Validation Thresholds
MIN_VALID_TEMPERATURE = -50.0  # °C (lowest recorded planetary realistic threshold)
MAX_VALID_TEMPERATURE = 60.0   # °C (highest recorded planetary realistic threshold)
MIN_VALID_HUMIDITY = 0.0       # %
MAX_VALID_HUMIDITY = 100.0     # %
MIN_VALID_RAINFALL = 0.0       # mm (rainfall cannot be negative)
MAX_VALID_RAINFALL = 1500.0    # mm (single-day cloudburst upper bound)

# Application Metadata
APP_TITLE = "Weather Data Analysis System"
APP_SUBTITLE = "Analyze Historical Weather Data with Python"
COLLEGE_PROJECT_LABEL = "B.Tech CSE Project • Meteorological Analytics"
VERSION = "1.0.0"
