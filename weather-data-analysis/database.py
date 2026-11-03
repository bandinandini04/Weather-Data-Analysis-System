"""
Database management module for Weather Data Analysis System.
Provides MySQL connectivity, schema migration, record insertion, and fallback handling.
"""

import logging
from typing import Optional, Tuple, List, Dict, Any
import pandas as pd
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

logger = logging.getLogger(__name__)

# Try importing mysql connector safely
try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    MySQLError = Exception


class WeatherDatabase:
    """Manages connection and CRUD operations for weather observations in MySQL."""

    def __init__(self):
        self.is_connected = False
        self.last_error = ""
        self._test_connection()

    def _test_connection(self) -> bool:
        """Tests if MySQL server is reachable with the configured credentials."""
        if not MYSQL_AVAILABLE:
            self.last_error = "mysql-connector-python package is not installed."
            self.is_connected = False
            return False

        try:
            conn = mysql.connector.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                connection_timeout=2
            )
            if conn.is_connected():
                # Check or create target database
                cursor = conn.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`;")
                conn.commit()
                cursor.close()
                conn.close()

                # Initialize tables
                self._initialize_schema()
                self.is_connected = True
                self.last_error = ""
                return True
        except Exception as err:
            self.last_error = str(err)
            self.is_connected = False
            return False

    def get_connection(self):
        """Creates and returns an active MySQL connection object."""
        if not MYSQL_AVAILABLE:
            raise RuntimeError("MySQL connector not available.")
        return mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )

    def _initialize_schema(self):
        """Creates the weather_records table if it does not already exist."""
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
        """Returns database connectivity status and configuration for UI display."""
        # Retest on demand
        self._test_connection()
        return {
            "driver_installed": MYSQL_AVAILABLE,
            "connected": self.is_connected,
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME,
            "user": DB_USER,
            "mode": "MySQL Database Mode" if self.is_connected else "CSV Demonstration Mode (Standalone)",
            "message": "Connected successfully to MySQL" if self.is_connected else f"Offline / Standalone mode ({self.last_error})"
        }

    def insert_records(self, valid_df: pd.DataFrame) -> Tuple[int, Optional[str]]:
        """
        Inserts validated weather records into the MySQL database.
        Returns: (number_of_rows_inserted, error_message_if_any)
        """
        if not self.is_connected:
            return 0, "Database is not connected. Operating in CSV Demonstration Mode."

        if valid_df.empty:
            return 0, "No records to insert."

        insert_sql = """
        INSERT INTO weather_records (observation_date, location, temperature, humidity, rainfall)
        VALUES (%s, %s, %s, %s, %s)
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()

            records_to_insert = []
            for _, row in valid_df.iterrows():
                records_to_insert.append((
                    str(row["observation_date"]),
                    str(row["location"]),
                    float(row["temperature"]),
                    float(row["humidity"]),
                    float(row["rainfall"])
                ))

            cursor.executemany(insert_sql, records_to_insert)
            conn.commit()
            count = cursor.rowcount
            cursor.close()
            conn.close()
            return count, None
        except Exception as err:
            return 0, f"Database insert failed: {str(err)}"

    def fetch_records(self, limit: int = 1000) -> Tuple[pd.DataFrame, Optional[str]]:
        """Fetches stored records from MySQL database."""
        if not self.is_connected:
            return pd.DataFrame(), "Database is offline."

        try:
            conn = self.get_connection()
            query = f"SELECT record_id, observation_date, location, temperature, humidity, rainfall FROM weather_records ORDER BY observation_date DESC LIMIT {limit}"
            df = pd.read_sql(query, conn)
            conn.close()
            return df, None
        except Exception as err:
            return pd.DataFrame(), f"Query error: {str(err)}"

    def clear_records(self) -> Tuple[bool, Optional[str]]:
        """Truncates the weather_records table for fresh demonstration."""
        if not self.is_connected:
            return False, "Database not connected."
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("TRUNCATE TABLE weather_records;")
            conn.commit()
            cursor.close()
            conn.close()
            return True, None
        except Exception as err:
            return False, str(err)


# Singleton instance
db_instance = WeatherDatabase()
