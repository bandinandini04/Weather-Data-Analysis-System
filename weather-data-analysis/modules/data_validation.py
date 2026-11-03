"""
Data validation module for Weather Data Analysis System.
Performs strict validation on raw uploaded datasets and audits anomalies.
Separates records into Valid and Invalid DataFrames with explicit rejection reasons.
"""

from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
from config import (
    REQUIRED_COLUMNS,
    MIN_VALID_TEMPERATURE,
    MAX_VALID_TEMPERATURE,
    MIN_VALID_HUMIDITY,
    MAX_VALID_HUMIDITY,
    MIN_VALID_RAINFALL,
    MAX_VALID_RAINFALL
)


def validate_weather_data(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Validates uploaded raw weather observation DataFrame.

    Checks:
    1. Missing values (null, NaN, empty strings)
    2. Duplicate records (identical observation_date and location)
    3. Invalid dates (cannot be parsed to valid datetime)
    4. Non-numeric values in numeric columns (temperature, humidity, rainfall)
    5. Invalid temperature range (outside -50°C to 60°C)
    6. Invalid humidity range (outside 0% to 100%)
    7. Negative rainfall values or unrealistic spikes (> 1500mm)

    Returns:
        valid_df (pd.DataFrame): Validated, cleaned, and properly typed records.
        invalid_df (pd.DataFrame): Rejected records with 'rejection_reason' column.
        summary (dict): Detailed summary counts for audit reporting.
    """
    if df_raw is None or df_raw.empty:
        empty_df = pd.DataFrame(columns=REQUIRED_COLUMNS)
        return empty_df, empty_df.copy(), {
            "total_records": 0,
            "accepted_records": 0,
            "rejected_records": 0,
            "missing_values_count": 0,
            "duplicates_count": 0,
            "invalid_dates_count": 0,
            "non_numeric_count": 0,
            "out_of_range_temp_count": 0,
            "out_of_range_humidity_count": 0,
            "negative_rainfall_count": 0,
        }

    df = df_raw.copy()

    # Track metrics
    total_records = len(df)
    missing_count = 0
    duplicate_count = 0
    invalid_dates_count = 0
    non_numeric_count = 0
    temp_range_count = 0
    humidity_range_count = 0
    rainfall_negative_count = 0

    reasons: List[List[str]] = [[] for _ in range(total_records)]

    # 1. Check required columns presence
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Uploaded CSV is missing mandatory columns: {', '.join(missing_cols)}")

    # 2. Check for missing values in any required column
    for idx, row in df.iterrows():
        null_cols = []
        for col in REQUIRED_COLUMNS:
            val = row[col]
            if pd.isna(val) or str(val).strip() == "" or str(val).strip().lower() in ["nan", "null", "none"]:
                null_cols.append(col)
        if null_cols:
            missing_count += 1
            reasons[idx].append(f"Missing value in column(s): {', '.join(null_cols)}")

    # 3. Check for duplicates on (observation_date, location)
    # We strip strings for robust duplicate matching
    date_loc_pairs = df.apply(
        lambda r: f"{str(r['observation_date']).strip()}|{str(r['location']).strip().lower()}",
        axis=1
    )
    dup_mask = date_loc_pairs.duplicated(keep="first")
    for idx, is_dup in enumerate(dup_mask):
        if is_dup:
            duplicate_count += 1
            reasons[idx].append("Duplicate observation for the same location and date")

    # 4. Check date validity
    parsed_dates = []
    for idx, val in enumerate(df["observation_date"]):
        parsed_date = None
        try:
            # Pandas parse
            dt = pd.to_datetime(val, errors="coerce")
            if pd.isna(dt):
                reasons[idx].append(f"Invalid date format or unparseable date: '{val}'")
                invalid_dates_count += 1
            else:
                # Check year bounds (1900 to 2100)
                if dt.year < 1900 or dt.year > 2100:
                    reasons[idx].append(f"Date year out of bounds (1900-2100): {dt.year}")
                    invalid_dates_count += 1
                else:
                    parsed_date = dt.strftime("%Y-%m-%d")
        except Exception:
            reasons[idx].append(f"Date parsing failed: '{val}'")
            invalid_dates_count += 1
        parsed_dates.append(parsed_date)

    # 5. Check numeric types and physical thresholds
    parsed_temps = []
    parsed_humidities = []
    parsed_rainfalls = []

    for idx, row in df.iterrows():
        # Temperature validation
        t_val = row["temperature"]
        try:
            t_num = float(t_val)
            if np.isnan(t_num) or np.isinf(t_num):
                reasons[idx].append(f"Non-numeric or NaN temperature: '{t_val}'")
                non_numeric_count += 1
                parsed_temps.append(np.nan)
            elif t_num < MIN_VALID_TEMPERATURE or t_num > MAX_VALID_TEMPERATURE:
                reasons[idx].append(
                    f"Temperature {t_num}°C out of realistic range [{MIN_VALID_TEMPERATURE}°C to {MAX_VALID_TEMPERATURE}°C]"
                )
                temp_range_count += 1
                parsed_temps.append(t_num)
            else:
                parsed_temps.append(t_num)
        except (ValueError, TypeError):
            reasons[idx].append(f"Non-numeric temperature value: '{t_val}'")
            non_numeric_count += 1
            parsed_temps.append(np.nan)

        # Humidity validation
        h_val = row["humidity"]
        try:
            h_num = float(h_val)
            if np.isnan(h_num) or np.isinf(h_num):
                reasons[idx].append(f"Non-numeric or NaN humidity: '{h_val}'")
                non_numeric_count += 1
                parsed_humidities.append(np.nan)
            elif h_num < MIN_VALID_HUMIDITY or h_num > MAX_VALID_HUMIDITY:
                reasons[idx].append(
                    f"Humidity {h_num}% is outside valid range [{MIN_VALID_HUMIDITY}% to {MAX_VALID_HUMIDITY}%]"
                )
                humidity_range_count += 1
                parsed_humidities.append(h_num)
            else:
                parsed_humidities.append(h_num)
        except (ValueError, TypeError):
            reasons[idx].append(f"Non-numeric humidity value: '{h_val}'")
            non_numeric_count += 1
            parsed_humidities.append(np.nan)

        # Rainfall validation
        r_val = row["rainfall"]
        try:
            r_num = float(r_val)
            if np.isnan(r_num) or np.isinf(r_num):
                reasons[idx].append(f"Non-numeric or NaN rainfall: '{r_val}'")
                non_numeric_count += 1
                parsed_rainfalls.append(np.nan)
            elif r_num < MIN_VALID_RAINFALL:
                reasons[idx].append(f"Negative rainfall is physically impossible: {r_num} mm")
                rainfall_negative_count += 1
                parsed_rainfalls.append(r_num)
            elif r_num > MAX_VALID_RAINFALL:
                reasons[idx].append(f"Rainfall exceeds plausible cloudburst threshold ({MAX_VALID_RAINFALL} mm): {r_num} mm")
                parsed_rainfalls.append(r_num)
            else:
                parsed_rainfalls.append(r_num)
        except (ValueError, TypeError):
            reasons[idx].append(f"Non-numeric rainfall value: '{r_val}'")
            non_numeric_count += 1
            parsed_rainfalls.append(np.nan)

    # Compile rejection reasons
    rejection_strings = ["; ".join(r) if r else "" for r in reasons]
    df["rejection_reason"] = rejection_strings

    # Valid mask
    valid_mask = df["rejection_reason"] == ""

    # Build clean valid dataframe
    valid_df = df[valid_mask].copy()
    valid_df["observation_date"] = [parsed_dates[i] for i in valid_df.index]
    valid_df["temperature"] = [parsed_temps[i] for i in valid_df.index]
    valid_df["humidity"] = [parsed_humidities[i] for i in valid_df.index]
    valid_df["rainfall"] = [parsed_rainfalls[i] for i in valid_df.index]
    valid_df["location"] = valid_df["location"].astype(str).str.strip().str.title()
    valid_df.drop(columns=["rejection_reason"], inplace=True)
    valid_df.reset_index(drop=True, inplace=True)

    # Build invalid dataframe
    invalid_df = df[~valid_mask].copy()
    invalid_df.reset_index(drop=True, inplace=True)

    summary = {
        "total_records": total_records,
        "accepted_records": len(valid_df),
        "rejected_records": len(invalid_df),
        "acceptance_rate_pct": round((len(valid_df) / total_records * 100), 2) if total_records > 0 else 0,
        "missing_values_count": missing_count,
        "duplicates_count": duplicate_count,
        "invalid_dates_count": invalid_dates_count,
        "non_numeric_count": non_numeric_count,
        "out_of_range_temp_count": temp_range_count,
        "out_of_range_humidity_count": humidity_range_count,
        "negative_rainfall_count": rainfall_negative_count,
    }

    return valid_df, invalid_df, summary
