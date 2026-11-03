import jsPDF from "jspdf";
import { ValidWeatherRecord, InvalidWeatherRecord, OverallStatistics, MonthlyAggregation, ValidationSummary } from "../types";

export function downloadBlob(content: string | Blob, filename: string, mimeType: string = "text/csv") {
  const blob = typeof content === "string" ? new Blob([content], { type: `${mimeType};charset=utf-8;` }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCleanedCSV(records: ValidWeatherRecord[]) {
  const header = "observation_date,location,temperature,humidity,rainfall\n";
  const rows = records.map(r => `${r.observation_date},"${r.location}",${r.temperature},${r.humidity},${r.rainfall}`).join("\n");
  downloadBlob(header + rows, "cleaned_weather_data.csv");
}

export function exportMonthlyCSV(monthly: MonthlyAggregation[]) {
  const header = "year,month,month_name,period,avg_temp,min_temp,max_temp,avg_humidity,total_rainfall,avg_rainfall,max_rainfall,record_count\n";
  const rows = monthly.map(m =>
    `${m.year},${m.month},"${m.month_name}","${m.period}",${m.avg_temp},${m.min_temp},${m.max_temp},${m.avg_humidity},${m.total_rainfall},${m.avg_rainfall},${m.max_rainfall},${m.record_count}`
  ).join("\n");
  downloadBlob(header + rows, "monthly_weather_analysis.csv");
}

export function exportAuditLogCSV(invalidRecords: InvalidWeatherRecord[]) {
  const header = "row_number,observation_date,location,temperature,humidity,rainfall,rejection_reason\n";
  const rows = invalidRecords.map(r =>
    `${r.row_number},"${r.observation_date}","${r.location}","${r.temperature}","${r.humidity}","${r.rainfall}","${r.rejection_reason.replace(/"/g, '""')}"`
  ).join("\n");
  downloadBlob(header + rows, "data_quality_audit_log.csv");
}

export function generateExecutivePDF(
  stats: OverallStatistics,
  monthly: MonthlyAggregation[],
  validation: ValidationSummary,
  datasetName: string = "Weather Dataset"
) {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter"
  });

  const primaryColor = "#0284c7";
  const darkTextColor = "#0f172a";
  const mutedTextColor = "#64748b";

  // Header Banner
  doc.setFillColor(2, 132, 199);
  doc.rect(36, 36, 540, 56, "F");

  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Weather Data Analysis System", 50, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor("#e0f2fe");
  doc.text("B.Tech CSE Project • Automated Historical Meteorological Analysis Report", 50, 78);

  // Meta Box
  let y = 110;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(36, y, 540, 36, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor);
  doc.text(`Dataset: ${datasetName}`, 48, y + 22);
  doc.text(`Date Range: ${stats.start_date} to ${stats.end_date}`, 240, y + 22);
  doc.text(`Stations: ${stats.unique_locations} Active`, 460, y + 22);

  // Section 1: Core Statistics Table
  y += 54;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text("1. Primary Meteorological Statistics", 36, y);

  y += 14;
  doc.setFillColor(3, 105, 161);
  doc.rect(36, y, 540, 20, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(8.5);
  doc.text("Category", 44, y + 14);
  doc.text("Meteorological Parameter", 160, y + 14);
  doc.text("Calculated Value", 380, y + 14);
  doc.text("Unit", 490, y + 14);

  const statRows = [
    ["Temperature", "Average Mean Temperature", `${stats.avg_temp.toFixed(2)}`, "°C"],
    ["Temperature", "Minimum Recorded Temperature", `${stats.min_temp.toFixed(2)}`, "°C"],
    ["Temperature", "Maximum Recorded Temperature", `${stats.max_temp.toFixed(2)}`, "°C"],
    ["Humidity", "Average Atmospheric Humidity", `${stats.avg_humidity.toFixed(2)}`, "%"],
    ["Humidity", "Minimum Atmospheric Humidity", `${stats.min_humidity.toFixed(2)}`, "%"],
    ["Humidity", "Maximum Atmospheric Humidity", `${stats.max_humidity.toFixed(2)}`, "%"],
    ["Precipitation", "Total Cumulative Rainfall", `${stats.total_rainfall.toFixed(2)}`, "mm"],
    ["Precipitation", "Average Daily Rainfall", `${stats.avg_rainfall.toFixed(2)}`, "mm"],
    ["Precipitation", "Maximum Single-Day Rain", `${stats.max_rainfall.toFixed(2)}`, "mm"]
  ];

  y += 20;
  statRows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(36, y, 540, 16, "F");
    }
    doc.setTextColor(darkTextColor);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], 44, y + 11);
    doc.text(row[1], 160, y + 11);
    doc.setFont("helvetica", "bold");
    doc.text(row[2], 380, y + 11);
    doc.setFont("helvetica", "normal");
    doc.text(row[3], 490, y + 11);
    y += 16;
  });

  // Section 2: Data Quality Audit
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text("2. Data Quality & Preprocessing Audit", 36, y);

  y += 14;
  doc.setFillColor(3, 105, 161);
  doc.rect(36, y, 540, 20, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(8.5);
  doc.text("Quality Check Verification", 44, y + 14);
  doc.text("Count", 280, y + 14);
  doc.text("Audit Status / Impact", 380, y + 14);

  const auditRows = [
    ["Total Raw Ingested Records", `${validation.total_records}`, "Baseline CSV records"],
    ["Accepted Valid Observations", `${validation.accepted_records}`, `Pass rate: ${validation.acceptance_rate_pct}%`],
    ["Rejected Malformed Observations", `${validation.rejected_records}`, "Isolated with explicit reasons"],
    ["Missing Values Encountered", `${validation.missing_values_count}`, "Null / blank field checks"],
    ["Duplicate Records Detected", `${validation.duplicates_count}`, "Same date + location pair"],
    ["Invalid Date Syntaxes", `${validation.invalid_dates_count}`, "Date bounds & parsing"],
    ["Non-Numeric Entries", `${validation.non_numeric_count}`, "String in numeric field"],
    ["Temperature Range Anomalies", `${validation.out_of_range_temp_count}`, "Outside -50°C to 60°C bounds"],
    ["Humidity Range Anomalies", `${validation.out_of_range_humidity_count}`, "Outside 0% to 100% bounds"],
    ["Negative Rainfall Errors", `${validation.negative_rainfall_count}`, "Physically impossible values (< 0 mm)"]
  ];

  y += 20;
  auditRows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(36, y, 540, 15, "F");
    }
    doc.setTextColor(darkTextColor);
    doc.setFont("helvetica", "normal");
    doc.text(row[0], 44, y + 11);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], 280, y + 11);
    doc.setFont("helvetica", "normal");
    doc.text(row[2], 380, y + 11);
    y += 15;
  });

  // Section 3: Monthly Breakdown (if fits)
  if (monthly.length > 0) {
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text("3. Monthly Aggregation Summary", 36, y);

    y += 14;
    doc.setFillColor(3, 105, 161);
    doc.rect(36, y, 540, 18, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(8);
    doc.text("Period", 44, y + 12);
    doc.text("Avg Temp", 130, y + 12);
    doc.text("Min / Max", 220, y + 12);
    doc.text("Avg Humidity", 310, y + 12);
    doc.text("Total Rain", 410, y + 12);
    doc.text("Records", 500, y + 12);

    y += 18;
    monthly.slice(0, 8).forEach((m, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(36, y, 540, 14, "F");
      }
      doc.setTextColor(darkTextColor);
      doc.setFont("helvetica", "normal");
      doc.text(m.period, 44, y + 10);
      doc.text(`${m.avg_temp}°C`, 130, y + 10);
      doc.text(`${m.min_temp}° / ${m.max_temp}°`, 220, y + 10);
      doc.text(`${m.avg_humidity}%`, 310, y + 10);
      doc.text(`${m.total_rainfall} mm`, 410, y + 10);
      doc.text(`${m.record_count}`, 500, y + 10);
      y += 14;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(mutedTextColor);
  doc.text("Generated by Weather Data Analysis System • Historical Data Analytics (No fake forecasts)", 36, 750);
  doc.text(`Timestamp: ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`, 420, 750);

  doc.save("Weather_Data_Analysis_Report.pdf");
}
