"""
Configuration settings for Weather Data Analysis Flask Backend.
Reads environment variables for server, database, security, and meteorological validation thresholds.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory paths
BASE_DIR = Path(__file__).resolve().parent
SAMPLE_CSV_PATH = BASE_DIR / "sample_weather.csv"

# Load .env file from backend/ or project root
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

# Server Configuration
PORT = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

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

# Physical and Statistical Validation Bounds
MIN_VALID_TEMPERATURE = -50.0  # °C
MAX_VALID_TEMPERATURE = 60.0   # °C
MIN_VALID_HUMIDITY = 0.0       # %
MAX_VALID_HUMIDITY = 100.0     # %
MIN_VALID_RAINFALL = 0.0       # mm (cannot be negative)
MAX_VALID_RAINFALL = 1500.0    # mm (cloudburst threshold)

# Security & Upload Constraints
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
ALLOWED_EXTENSIONS = {"csv"}
