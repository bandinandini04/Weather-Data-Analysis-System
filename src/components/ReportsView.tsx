import React, { useState } from "react";
import {
  ValidWeatherRecord,
  InvalidWeatherRecord,
  MonthlyAggregation,
  OverallStatistics,
  ValidationSummary
} from "../types";
import {
  exportCleanedCSV,
  exportMonthlyCSV,
  exportAuditLogCSV,
  generateExecutivePDF,
  downloadBlob
} from "../utils/reports";
import { exportComprehensiveExcelReport } from "../utils/excel";
import { computeLocationAnalysis } from "../utils/analysis";
import { weatherApi } from "../services/api";
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Server,
  Sparkles,
  Loader2,
  Table,
  Layers,
  ShieldCheck
} from "lucide-react";

interface ReportsViewProps {
  validRecords: ValidWeatherRecord[];
  invalidRecords: InvalidWeatherRecord[];
  monthlyData: MonthlyAggregation[];
  stats: OverallStatistics;
  validationSummary: ValidationSummary;
  datasetName: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  validRecords,
  invalidRecords,
  monthlyData,
  stats,
  validationSummary,
  datasetName
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (validRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 max-w-4xl mx-auto">
        Please upload or load a dataset first to generate exportable meteorological reports.
      </div>
    );
  }

  const handleDownloadExcel = () => {
    setDownloading("excel");
    try {
      const locationData = computeLocationAnalysis(validRecords);
      exportComprehensiveExcelReport(
        stats,
        validRecords,
        monthlyData,
        invalidRecords,
        validationSummary,
        locationData,
        datasetName
      );
    } catch (e) {
      console.error("Excel generation error:", e);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadCleaned = async () => {
    setDownloading("cleaned");
    try {
      const blob = await weatherApi.downloadCleanedCSV();
      downloadBlob(blob, "cleaned_weather_data.csv");
    } catch {
      exportCleanedCSV(validRecords);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadMonthly = async () => {
    setDownloading("monthly");
    try {
      const blob = await weatherApi.downloadMonthlyCSV();
      downloadBlob(blob, "monthly_weather_analysis.csv");
    } catch {
      exportMonthlyCSV(monthlyData);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadQuality = async () => {
    setDownloading("quality");
    try {
      const blob = await weatherApi.downloadQualityCSV();
      downloadBlob(blob, "data_quality_audit_log.csv");
    } catch {
      exportAuditLogCSV(invalidRecords);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading("pdf");
    try {
      const blob = await weatherApi.downloadPdfReport();
      downloadBlob(blob, "Weather_Analysis_Report.pdf", "application/pdf");
    } catch {
      generateExecutivePDF(stats, monthlyData, validationSummary, datasetName);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">📑 Meteorological Reports & Multi-Format Export</h2>
        <p className="text-xs text-slate-500">
          Generate, export, and download comprehensive meteorological summaries, data quality audits, Excel workbooks, and formatted academic PDFs.
        </p>
      </div>

      {/* Featured Master Excel Report Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
              Multi-Sheet Excel Workbook (.xlsx)
            </div>
            <h3 className="text-lg font-bold">Complete Analytical Dossier in Excel</h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              Includes 5 dedicated sheets: Executive Summary, Cleaned Weather Records, Monthly Trends, Station Comparison Matrix, and the full Data Quality Audit Log.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={downloading === "excel"}
          className="px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {downloading === "excel" ? <Loader2 className="w-4 h-4 animate-spin text-emerald-700" /> : <Download className="w-4 h-4" />}
          Download Complete Excel (.xlsx)
        </button>
      </div>

      {/* Grid: CSV Exports (Left) and PDF Executive Report (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Reports Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Tabular CSV Exports</h3>
          </div>
          <p className="text-xs text-slate-500">
            Export individual structured CSV data files formatted for Excel, SPSS, R, Python, and academic verification.
          </p>

          <div className="space-y-3">
            {/* 1. Cleaned CSV */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Cleaned Validated Dataset (CSV)</div>
                <div className="text-[11px] text-slate-500">{validRecords.length.toLocaleString()} sanitized records</div>
              </div>
              <button
                onClick={handleDownloadCleaned}
                disabled={downloading === "cleaned"}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {downloading === "cleaned" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                Download CSV
              </button>
            </div>

            {/* 2. Monthly Summary CSV */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Monthly Statistical Aggregations (CSV)</div>
                <div className="text-[11px] text-slate-500">{monthlyData.length} seasonal periods</div>
              </div>
              <button
                onClick={handleDownloadMonthly}
                disabled={downloading === "monthly"}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-sky-500 hover:text-sky-700 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {downloading === "monthly" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" /> : <Download className="w-3.5 h-3.5" />}
                Download CSV
              </button>
            </div>

            {/* 3. Data Quality Audit Log CSV */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition-colors">
              <div>
                <div className="text-xs font-bold text-slate-800">Data Quality & Rejection Audit Log (CSV)</div>
                <div className="text-[11px] text-slate-500">{invalidRecords.length} audited anomalies</div>
              </div>
              <button
                onClick={handleDownloadQuality}
                disabled={downloading === "quality"}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-rose-500 hover:text-rose-700 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {downloading === "quality" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Download className="w-3.5 h-3.5" />}
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Executive PDF Report Card */}
        <div className="bg-gradient-to-br from-white to-sky-50/50 rounded-2xl border border-sky-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-800">Executive PDF Report</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                Print-Ready PDF
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Generates a professionally compiled document featuring:
            </p>

            <ul className="text-xs space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Primary statistics table (Mean, Min, Max Temperature, Humidity, Total Rain)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Data quality audit ledger (Missing, Duplicates, Invalid bounds)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Monthly meteorological aggregation summary table</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>B.Tech CSE Project evaluation metadata and academic timestamps</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading === "pdf"}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {downloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4" />}
            Generate & Download Executive PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};
