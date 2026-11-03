"""
Data processing module for Weather Data Analysis System.
Extracts temporal features, standardizes formats, and filters subsets.
"""

from typing import List, Optional
import pandas as pd


def process_weather_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Enriches validated weather DataFrame with datetime dimensions:
    - observation_date
    - year (int)
    - month (int, 1-12)
    - month_name (e.g. 'January')
    - day (int, 1-31)
    - day_name (e.g. 'Monday')
    """
    if df.empty:
        return df.copy()

    processed = df.copy()
    processed["date_dt"] = pd.to_datetime(processed["observation_date"])
    processed["year"] = processed["date_dt"].dt.year
    processed["month"] = processed["date_dt"].dt.month
    processed["month_name"] = processed["date_dt"].dt.strftime("%B")
    processed["day"] = processed["date_dt"].dt.day
    processed["day_name"] = processed["date_dt"].dt.strftime("%A")

    processed["temperature"] = pd.to_numeric(processed["temperature"], errors="coerce")
    processed["humidity"] = pd.to_numeric(processed["humidity"], errors="coerce")
    processed["rainfall"] = pd.to_numeric(processed["rainfall"], errors="coerce")

    # Add 1-indexed ID if not present
    if "id" not in processed.columns:
        processed["id"] = range(1, len(processed) + 1)

    processed.sort_values(by=["observation_date", "location"], inplace=True)
    processed.reset_index(drop=True, inplace=True)

    return processed


def filter_weather_data(
    df: pd.DataFrame,
    locations: Optional[List[str]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    months: Optional[List[int]] = None,
    years: Optional[List[int]] = None
) -> pd.DataFrame:
    """
    Filters processed DataFrame according to user selections.
    """
    if df.empty:
        return df

    filtered = df.copy()

    if locations:
        filtered = filtered[filtered["location"].isin(locations)]

    if start_date:
        filtered = filtered[filtered["observation_date"] >= str(start_date)]

    if end_date:
        filtered = filtered[filtered["observation_date"] <= str(end_date)]

    if months:
        filtered = filtered[filtered["month"].isin(months)]

    if years:
        filtered = filtered[filtered["year"].isin(years)]

    return filtered.reset_index(drop=True)
