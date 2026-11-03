/**
 * Weather Data Analysis System - Excel Processing Utility
 * Supports importing Excel files (.xlsx, .xls) and exporting comprehensive multi-tab workbooks.
 */

import * as XLSX from "xlsx";
import {
  ValidWeatherRecord,
  InvalidWeatherRecord,
  MonthlyAggregation,
  OverallStatistics,
  ValidationSummary,
  LocationAggregation
} from "../types";
import { downloadBlob } from "./reports";

/**
 * Parses an Excel file (.xlsx or .xls) and converts its data into standard CSV text.
 */
export async function parseExcelFile(file: File): Promise<{ csvText: string; sheetName: string; rowCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("The uploaded Excel workbook contains no worksheets.");
  }

  // Try to find a sheet with 'weather' in name, or default to the first worksheet
  const targetSheetName =
    workbook.SheetNames.find(name => name.toLowerCase().includes("weather")) ||
    workbook.SheetNames[0];

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Could not access sheet "${targetSheetName}".`);
  }

  // Convert to CSV string
  const csvText = XLSX.utils.sheet_to_csv(worksheet, {
    blankrows: false,
    dateNF: "YYYY-MM-DD"
  });

  const rowCount = csvText.trim().split(/\r?\n/).length - 1; // excluding header
  return {
    csvText,
    sheetName: targetSheetName,
    rowCount: Math.max(0, rowCount)
  };
}

/**
 * Downloads a sample formatted Excel template (.xlsx) for first-time users.
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      observation_date: "2026-01-01",
      location: "Tirupati",
      temperature: 28.5,
      humidity: 62.0,
      rainfall: 0.0
    },
    {
      observation_date: "2026-01-02",
      location: "Chittoor",
      temperature: 26.8,
      humidity: 68.4,
      rainfall: 4.2
    },
    {
      observation_date: "2026-01-03",
      location: "Nellore",
      temperature: 30.1,
      humidity: 74.5,
      rainfall: 12.0
    },
    {
      observation_date: "2026-01-04",
      location: "Kadapa",
      temperature: 31.4,
      humidity: 58.2,
      rainfall: 0.0
    },
    {
      observation_date: "2026-01-05",
      location: "Chennai",
      temperature: 29.2,
      humidity: 79.0,
      rainfall: 8.5
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Weather_Data_Template");

  // Generate buffer and trigger download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(new Blob([wbout]), "sample_weather_template.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

/**
 * Generates and downloads a complete, professional multi-sheet Excel Workbook (.xlsx)
 * containing Executive Metrics, Valid Cleaned Records, Monthly Aggregates, Station Summaries, and Audit Log.
 */
export function exportComprehensiveExcelReport(
  stats: OverallStatistics,
  validRecords: ValidWeatherRecord[],
  monthlyData: MonthlyAggregation[],
  invalidRecords: InvalidWeatherRecord[],
  validation: ValidationSummary,
  locationData: LocationAggregation[],
  datasetName: string = "Weather Dataset"
): void {
  const workbook = XLSX.utils.book_new();

  // 1. Executive Summary Sheet
  const summaryRows = [
    ["WEATHER DATA ANALYSIS SYSTEM - EXECUTIVE DOSSIER"],
    ["Academic Project: B.Tech Computer Science & Engineering (Mohan Babu University 2026-2027)"],
    [""],
    ["Dataset Name", datasetName],
    ["Generation Timestamp", new Date().toLocaleString()],
    ["Date Range Covered", `${stats.start_date} to ${stats.end_date}`],
    ["Active Monitoring Stations", stats.unique_locations],
    [""],
    ["DATA QUALITY & VALIDATION SUMMARY", ""],
    ["Total Raw Records Audited", validation.total_records],
    ["Accepted Valid Records", validation.accepted_records],
    ["Rejected Corrupt / Out-of-Bounds Records", validation.rejected_records],
    ["Data Quality Acceptance Rate (%)", `${validation.acceptance_rate_pct.toFixed(2)}%`],
    ["Missing Values Found", validation.missing_values_count],
    ["Duplicate Rows Identified", validation.duplicates_count],
    ["Invalid Date Formats", validation.invalid_dates_count],
    ["Non-numeric Values", validation.non_numeric_count],
    ["Out-of-range Temperature Anomaly", validation.out_of_range_temp_count],
    ["Out-of-range Humidity Anomaly", validation.out_of_range_humidity_count],
    ["Negative Rainfall Anomalies", validation.negative_rainfall_count],
    [""],
    ["PRIMARY METEOROLOGICAL METRICS", ""],
    ["Average Mean Temperature (°C)", stats.avg_temp.toFixed(2)],
    ["Minimum Recorded Temperature (°C)", stats.min_temp.toFixed(2)],
    ["Maximum Recorded Temperature (°C)", stats.max_temp.toFixed(2)],
    ["Average Atmospheric Humidity (%)", stats.avg_humidity.toFixed(2)],
    ["Minimum Humidity (%)", stats.min_humidity.toFixed(2)],
    ["Maximum Humidity (%)", stats.max_humidity.toFixed(2)],
    ["Cumulative Total Rainfall (mm)", stats.total_rainfall.toFixed(2)],
    ["Average Daily Rainfall (mm)", stats.avg_rainfall.toFixed(2)],
    ["Single-day Peak Rainfall (mm)", stats.max_rainfall.toFixed(2)]
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive_Summary");

  // 2. Valid Weather Observations Sheet
  const validFormatted = validRecords.map(r => ({
    Record_ID: r.id,
    Observation_Date: r.observation_date,
    Location: r.location,
    Temperature_C: r.temperature,
    Humidity_Pct: r.humidity,
    Rainfall_mm: r.rainfall,
    Year: r.year,
    Month: r.month,
    Month_Name: r.month_name,
    Day_Name: r.day_name
  }));
  const validSheet = XLSX.utils.json_to_sheet(validFormatted);
  XLSX.utils.book_append_sheet(workbook, validSheet, "Valid_Cleaned_Records");

  // 3. Monthly Aggregations Sheet
  const monthlyFormatted = monthlyData.map(m => ({
    Period: m.period,
    Year: m.year,
    Month: m.month,
    Month_Name: m.month_name,
    Avg_Temperature_C: m.avg_temp,
    Min_Temperature_C: m.min_temp,
    Max_Temperature_C: m.max_temp,
    Avg_Humidity_Pct: m.avg_humidity,
    Total_Rainfall_mm: m.total_rainfall,
    Avg_Rainfall_mm: m.avg_rainfall,
    Peak_Rainfall_mm: m.max_rainfall,
    Records_Audited: m.record_count
  }));
  const monthlySheet = XLSX.utils.json_to_sheet(monthlyFormatted);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly_Analysis");

  // 4. Station Comparison Breakdown
  if (locationData && locationData.length > 0) {
    const locationFormatted = locationData.map(l => ({
      Station_Location: l.location,
      Records_Count: l.record_count,
      Avg_Temperature_C: l.avg_temp,
      Min_Temperature_C: l.min_temp,
      Max_Temperature_C: l.max_temp,
      Avg_Humidity_Pct: l.avg_humidity,
      Total_Rainfall_mm: l.total_rainfall,
      Avg_Rainfall_mm: l.avg_rainfall,
      Max_Rainfall_mm: l.max_rainfall
    }));
    const locationSheet = XLSX.utils.json_to_sheet(locationFormatted);
    XLSX.utils.book_append_sheet(workbook, locationSheet, "Station_Comparison");
  }

  // 5. Data Quality Audit Log (Invalid Records)
  const invalidFormatted = invalidRecords.map(inv => ({
    Row_Number: inv.row_number,
    Observation_Date: inv.observation_date,
    Location: inv.location,
    Raw_Temperature: inv.temperature,
    Raw_Humidity: inv.humidity,
    Raw_Rainfall: inv.rainfall,
    Rejection_Reason: inv.rejection_reason
  }));
  const invalidSheet = XLSX.utils.json_to_sheet(invalidFormatted);
  XLSX.utils.book_append_sheet(workbook, invalidSheet, "Quality_Audit_Log");

  // Trigger write and download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    new Blob([wbout]),
    `Weather_Analysis_Complete_${datasetName.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}
