"""
Report generation module for Weather Data Analysis System.
Exports data analysis tables to CSV and generates formatted PDF executive reports using ReportLab.
"""

import io
from typing import Dict, Any
import pandas as pd

# Safe ReportLab import
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def dataframe_to_csv_bytes(df: pd.DataFrame) -> bytes:
    """Converts a pandas DataFrame to encoded CSV bytes for download."""
    return df.to_csv(index=False).encode("utf-8")


def generate_pdf_summary_report(
    summary_stats: Dict[str, Any],
    monthly_df: pd.DataFrame,
    validation_summary: Dict[str, Any],
    dataset_name: str = "Weather Dataset"
) -> bytes:
    """
    Generates a structured multi-section PDF executive report for college evaluation and submission.
    """
    buffer = io.BytesIO()

    if not REPORTLAB_AVAILABLE:
        # Fallback text buffer if ReportLab is not installed
        fallback_text = f"Weather Data Analysis System Report\nDataset: {dataset_name}\n"
        fallback_text += f"Total Records: {summary_stats.get('record_count')}\n"
        fallback_text += f"Avg Temperature: {summary_stats.get('avg_temp')} °C\n"
        fallback_text += f"Avg Humidity: {summary_stats.get('avg_humidity')} %\n"
        fallback_text += f"Total Rainfall: {summary_stats.get('total_rainfall')} mm\n"
        return fallback_text.encode("utf-8")

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0284c7'),
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b')
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    # Document Header
    story.append(Paragraph("Weather Data Analysis System", title_style))
    story.append(Paragraph("B.Tech CSE Project • Automated Historical Meteorological Analysis Report", subtitle_style))
    story.append(Spacer(1, 10))

    # Meta banner
    meta_data = [
        [
            Paragraph(f"<b>Dataset:</b> {dataset_name}", body_style),
            Paragraph(f"<b>Date Range:</b> {summary_stats.get('start_date', 'N/A')} to {summary_stats.get('end_date', 'N/A')}", body_style),
            Paragraph(f"<b>Unique Stations:</b> {summary_stats.get('unique_locations', 'N/A')}", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[200, 200, 140])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Section 1: Statistical Summary
    story.append(Paragraph("1. Primary Meteorological Statistics", h2_style))

    summary_rows = [
        ["Metric Category", "Parameter", "Calculated Value", "Measurement Unit"],
        ["Temperature", "Average Temperature", f"{summary_stats.get('avg_temp', 0):.2f}", "°C"],
        ["Temperature", "Minimum Temperature", f"{summary_stats.get('min_temp', 0):.2f}", "°C"],
        ["Temperature", "Maximum Temperature", f"{summary_stats.get('max_temp', 0):.2f}", "°C"],
        ["Humidity", "Average Humidity", f"{summary_stats.get('avg_humidity', 0):.2f}", "%"],
        ["Humidity", "Minimum Humidity", f"{summary_stats.get('min_humidity', 0):.2f}", "%"],
        ["Humidity", "Maximum Humidity", f"{summary_stats.get('max_humidity', 0):.2f}", "%"],
        ["Rainfall", "Total Precipitation", f"{summary_stats.get('total_rainfall', 0):.2f}", "mm"],
        ["Rainfall", "Daily Average Rainfall", f"{summary_stats.get('avg_rainfall', 0):.2f}", "mm"],
        ["Rainfall", "Maximum Single-Day Rain", f"{summary_stats.get('max_rainfall', 0):.2f}", "mm"],
    ]
    t1 = Table(summary_rows, colWidths=[120, 180, 120, 120])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t1)
    story.append(Spacer(1, 12))

    # Section 2: Data Quality Audit
    story.append(Paragraph("2. Data Quality & Preprocessing Audit", h2_style))
    audit_rows = [
        ["Data Quality Check", "Record Count", "Status / Notes"],
        ["Total Raw Ingested Records", str(validation_summary.get('total_records', 0)), "Initial CSV intake"],
        ["Accepted Valid Records", str(validation_summary.get('accepted_records', 0)), f"Acceptance Rate: {validation_summary.get('acceptance_rate_pct', 100)}%"],
        ["Rejected Invalid Records", str(validation_summary.get('rejected_records', 0)), "Excluded from analytics to prevent bias"],
        ["Missing Values Found", str(validation_summary.get('missing_values_count', 0)), "Null or empty cell detections"],
        ["Duplicate Observations", str(validation_summary.get('duplicates_count', 0)), "Same date and location pair"],
        ["Invalid Date Formats", str(validation_summary.get('invalid_dates_count', 0)), "Unparseable or out-of-bounds dates"],
        ["Non-Numeric Readings", str(validation_summary.get('non_numeric_count', 0)), "String characters in numeric fields"],
        ["Out-of-Range Temperature", str(validation_summary.get('out_of_range_temp_count', 0)), "Outside -50°C to 60°C bounds"],
        ["Out-of-Range Humidity", str(validation_summary.get('out_of_range_humidity_count', 0)), "Outside 0% to 100% bounds"],
        ["Negative Rainfall Values", str(validation_summary.get('negative_rainfall_count', 0)), "Physical anomaly (< 0 mm)"]
    ]
    t2 = Table(audit_rows, colWidths=[180, 120, 240])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0369a1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t2)
    story.append(Spacer(1, 12))

    # Section 3: Monthly Breakdown (if available)
    if not monthly_df.empty:
        story.append(Paragraph("3. Monthly Meteorological Aggregation", h2_style))
        m_head = ["Period", "Avg Temp (°C)", "Min / Max (°C)", "Avg Humidity (%)", "Total Rain (mm)", "Records"]
        m_rows = [m_head]
        for _, r in monthly_df.head(12).iterrows():
            m_rows.append([
                str(r.get("period", "")),
                f"{r.get('avg_temp', 0):.1f}",
                f"{r.get('min_temp', 0):.1f} / {r.get('max_temp', 0):.1f}",
                f"{r.get('avg_humidity', 0):.1f}%",
                f"{r.get('total_rainfall', 0):.1f}",
                str(r.get("record_count", 0))
            ])
        t3 = Table(m_rows, colWidths=[100, 90, 110, 100, 80, 60])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        story.append(t3)

    # Footer note
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "<i>Generated by Weather Data Analysis System • Historical Data Analytics (No forecasting or mock predictions).</i>",
        subtitle_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
