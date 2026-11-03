"""
Visualization module for Weather Data Analysis System.
Generates interactive Plotly figures and static Matplotlib figures for weather data.
Follows professional blue, light-blue, and clean contrast styling.
"""

import plotly.graph_objects as go
import plotly.express as px
import pandas as pd


# Color Palette
PRIMARY_BLUE = "#0284c7"      # Tailwind Sky 600
DARK_BLUE = "#0369a1"         # Tailwind Sky 700
LIGHT_BLUE = "#38bdf8"        # Tailwind Sky 400
ACCENT_CYAN = "#06b6d4"       # Cyan 500
AMBER_ACCENT = "#f59e0b"      # Amber for heat
BG_CARD = "#ffffff"
GRID_COLOR = "#f1f5f9"


def plot_monthly_avg_temperature(monthly_df: pd.DataFrame) -> go.Figure:
    """
    1. Monthly Average Temperature – Line Chart
    Displays average, min, and max temperature per month.
    """
    fig = go.Figure()

    if monthly_df.empty:
        fig.add_annotation(text="No weather data available", showarrow=False, font=dict(size=14))
        return fig

    # Average temperature line
    fig.add_trace(go.Scatter(
        x=monthly_df["period"],
        y=monthly_df["avg_temp"],
        mode="lines+markers",
        name="Average Temp (°C)",
        line=dict(color=DARK_BLUE, width=3),
        marker=dict(size=8, color=DARK_BLUE, symbol="circle"),
        hovertemplate="<b>%{x}</b><br>Average Temp: %{y:.1f} °C<extra></extra>"
    ))

    # Min temperature line
    fig.add_trace(go.Scatter(
        x=monthly_df["period"],
        y=monthly_df["min_temp"],
        mode="lines+markers",
        name="Min Temp (°C)",
        line=dict(color=LIGHT_BLUE, width=2, dash="dash"),
        marker=dict(size=6, color=LIGHT_BLUE),
        hovertemplate="<b>%{x}</b><br>Min Temp: %{y:.1f} °C<extra></extra>"
    ))

    # Max temperature line
    fig.add_trace(go.Scatter(
        x=monthly_df["period"],
        y=monthly_df["max_temp"],
        mode="lines+markers",
        name="Max Temp (°C)",
        line=dict(color="#f97316", width=2, dash="dot"),
        marker=dict(size=6, color="#f97316"),
        hovertemplate="<b>%{x}</b><br>Max Temp: %{y:.1f} °C<extra></extra>"
    ))

    fig.update_layout(
        title="<b>Monthly Average Temperature Trend</b>",
        xaxis_title="Month / Observation Period",
        yaxis_title="Temperature (°C)",
        template="plotly_white",
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=40, r=40, t=60, b=40),
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff"
    )
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)

    return fig


def plot_monthly_rainfall(monthly_df: pd.DataFrame) -> go.Figure:
    """
    2. Monthly Rainfall – Bar Chart
    Shows total precipitation per month with labels.
    """
    fig = go.Figure()

    if monthly_df.empty:
        fig.add_annotation(text="No weather data available", showarrow=False, font=dict(size=14))
        return fig

    fig.add_trace(go.Bar(
        x=monthly_df["period"],
        y=monthly_df["total_rainfall"],
        name="Total Rainfall (mm)",
        marker=dict(
            color=monthly_df["total_rainfall"],
            colorscale=[[0, "#bae6fd"], [0.5, "#38bdf8"], [1, "#0284c7"]],
            line=dict(color="#0369a1", width=1.5)
        ),
        text=monthly_df["total_rainfall"].apply(lambda v: f"{v:.1f} mm"),
        textposition="outside",
        hovertemplate="<b>%{x}</b><br>Total Rainfall: %{y:.1f} mm<extra></extra>"
    ))

    fig.update_layout(
        title="<b>Monthly Total Rainfall Distribution</b>",
        xaxis_title="Month / Observation Period",
        yaxis_title="Total Precipitation (mm)",
        template="plotly_white",
        margin=dict(l=40, r=40, t=60, b=40),
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff"
    )
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)

    return fig


def plot_monthly_avg_humidity(monthly_df: pd.DataFrame) -> go.Figure:
    """
    3. Monthly Average Humidity – Line Chart with smooth area fill
    """
    fig = go.Figure()

    if monthly_df.empty:
        fig.add_annotation(text="No weather data available", showarrow=False, font=dict(size=14))
        return fig

    fig.add_trace(go.Scatter(
        x=monthly_df["period"],
        y=monthly_df["avg_humidity"],
        mode="lines+markers",
        name="Average Humidity (%)",
        line=dict(color="#0ea5e9", width=3, shape="spline"),
        fill="tozeroy",
        fillcolor="rgba(14, 165, 233, 0.12)",
        marker=dict(size=8, color="#0284c7"),
        hovertemplate="<b>%{x}</b><br>Average Humidity: %{y:.1f}%<extra></extra>"
    ))

    fig.update_layout(
        title="<b>Monthly Average Humidity Trend</b>",
        xaxis_title="Month / Observation Period",
        yaxis_title="Relative Humidity (%)",
        yaxis_range=[0, 100],
        template="plotly_white",
        margin=dict(l=40, r=40, t=60, b=40),
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff"
    )
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)

    return fig


def plot_temperature_comparison(location_df: pd.DataFrame) -> go.Figure:
    """
    4. Temperature Comparison – Bar Chart across locations
    Compares Min, Average, and Max temperature by Station/Location.
    """
    fig = go.Figure()

    if location_df.empty:
        fig.add_annotation(text="No weather data available", showarrow=False, font=dict(size=14))
        return fig

    fig.add_trace(go.Bar(
        x=location_df["location"],
        y=location_df["min_temp"],
        name="Minimum Temp (°C)",
        marker_color="#93c5fd"
    ))

    fig.add_trace(go.Bar(
        x=location_df["location"],
        y=location_df["avg_temp"],
        name="Average Temp (°C)",
        marker_color="#0284c7"
    ))

    fig.add_trace(go.Bar(
        x=location_df["location"],
        y=location_df["max_temp"],
        name="Maximum Temp (°C)",
        marker_color="#f97316"
    ))

    fig.update_layout(
        barmode="group",
        title="<b>Temperature Comparison Across Weather Stations / Locations</b>",
        xaxis_title="Location / Weather Station",
        yaxis_title="Temperature (°C)",
        template="plotly_white",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=40, r=40, t=60, b=40),
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff"
    )
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)

    return fig


def plot_daily_temperature_trends(daily_df: pd.DataFrame) -> go.Figure:
    """
    5. Daily Temperature Trends – Line Chart
    Chronological observation-level day-by-day temperature.
    """
    fig = go.Figure()

    if daily_df.empty:
        fig.add_annotation(text="No weather data available", showarrow=False, font=dict(size=14))
        return fig

    fig.add_trace(go.Scatter(
        x=daily_df["observation_date"],
        y=daily_df["avg_temp"],
        mode="lines",
        name="Daily Mean Temp (°C)",
        line=dict(color="#0284c7", width=2),
        hovertemplate="<b>Date: %{x}</b><br>Daily Temp: %{y:.1f} °C<extra></extra>"
    ))

    fig.update_layout(
        title="<b>Daily Historical Temperature Timeline</b>",
        xaxis_title="Observation Date",
        yaxis_title="Temperature (°C)",
        template="plotly_white",
        margin=dict(l=40, r=40, t=60, b=40),
        plot_bgcolor="#ffffff",
        paper_bgcolor="#ffffff"
    )
    fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)
    fig.update_yaxes(showgrid=True, gridwidth=1, gridcolor=GRID_COLOR)

    return fig
