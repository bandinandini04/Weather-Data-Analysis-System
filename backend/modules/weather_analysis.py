"""
Weather analysis module for Weather Data Analysis System.
Computes statistical summaries across temperature, humidity, rainfall, and spatial/temporal groupings.
"""

from typing import Dict, Any
import pandas as pd
import numpy as np


def compute_overall_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes summary metrics from actual weather records:
    - Average, Minimum, Maximum Temperature (°C)
    - Average, Minimum, Maximum Humidity (%)
    - Total, Average, Maximum Rainfall (mm)
    - Record count and date bounds
    """
    if df.empty:
        return {
            "record_count": 0,
            "avg_temp": 0.0,
            "min_temp": 0.0,
            "max_temp": 0.0,
            "avg_humidity": 0.0,
            "min_humidity": 0.0,
            "max_humidity": 0.0,
            "total_rainfall": 0.0,
            "avg_rainfall": 0.0,
            "max_rainfall": 0.0,
            "start_date": "N/A",
            "end_date": "N/A",
            "unique_locations": 0
        }

    return {
        "record_count": int(len(df)),
        "avg_temp": round(float(df["temperature"].mean()), 2),
        "min_temp": round(float(df["temperature"].min()), 2),
        "max_temp": round(float(df["temperature"].max()), 2),
        "avg_humidity": round(float(df["humidity"].mean()), 2),
        "min_humidity": round(float(df["humidity"].min()), 2),
        "max_humidity": round(float(df["humidity"].max()), 2),
        "total_rainfall": round(float(df["rainfall"].sum()), 2),
        "avg_rainfall": round(float(df["rainfall"].mean()), 2),
        "max_rainfall": round(float(df["rainfall"].max()), 2),
        "start_date": str(df["observation_date"].min()),
        "end_date": str(df["observation_date"].max()),
        "unique_locations": int(df["location"].nunique())
    }


def compute_monthly_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates weather observations by Year and Month.
    """
    if df.empty:
        return pd.DataFrame()

    monthly = df.groupby(["year", "month", "month_name"]).agg(
        avg_temp=("temperature", "mean"),
        min_temp=("temperature", "min"),
        max_temp=("temperature", "max"),
        avg_humidity=("humidity", "mean"),
        min_humidity=("humidity", "min"),
        max_humidity=("humidity", "max"),
        total_rainfall=("rainfall", "sum"),
        avg_rainfall=("rainfall", "mean"),
        max_rainfall=("rainfall", "max"),
        record_count=("temperature", "count")
    ).reset_index()

    monthly.sort_values(by=["year", "month"], inplace=True)
    monthly["period"] = monthly.apply(lambda r: f"{r['month_name'][:3]} {int(r['year'])}", axis=1)

    for col in ["avg_temp", "min_temp", "max_temp", "avg_humidity", "min_humidity", "max_humidity", "total_rainfall", "avg_rainfall", "max_rainfall"]:
        monthly[col] = monthly[col].round(2)

    return monthly.reset_index(drop=True)


def compute_daily_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates weather observations by observation_date.
    """
    if df.empty:
        return pd.DataFrame()

    daily = df.groupby("observation_date").agg(
        avg_temp=("temperature", "mean"),
        min_temp=("temperature", "min"),
        max_temp=("temperature", "max"),
        avg_humidity=("humidity", "mean"),
        total_rainfall=("rainfall", "sum"),
        max_rainfall=("rainfall", "max"),
        location_count=("location", "nunique")
    ).reset_index()

    daily.sort_values(by="observation_date", inplace=True)
    for col in ["avg_temp", "min_temp", "max_temp", "avg_humidity", "total_rainfall", "max_rainfall"]:
        daily[col] = daily[col].round(2)

    return daily.reset_index(drop=True)


def compute_location_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates weather observations across different locations/stations.
    """
    if df.empty:
        return pd.DataFrame()

    location_summary = df.groupby("location").agg(
        record_count=("temperature", "count"),
        avg_temp=("temperature", "mean"),
        min_temp=("temperature", "min"),
        max_temp=("temperature", "max"),
        avg_humidity=("humidity", "mean"),
        total_rainfall=("rainfall", "sum"),
        avg_rainfall=("rainfall", "mean"),
        max_rainfall=("rainfall", "max")
    ).reset_index()

    location_summary.sort_values(by="total_rainfall", ascending=False, inplace=True)
    for col in ["avg_temp", "min_temp", "max_temp", "avg_humidity", "total_rainfall", "avg_rainfall", "max_rainfall"]:
        location_summary[col] = location_summary[col].round(2)

    return location_summary.reset_index(drop=True)
