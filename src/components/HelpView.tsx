import React, { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  LineChart,
  Download,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Lightbulb,
  GraduationCap
} from "lucide-react";

export const HelpView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What file formats does the system accept for weather data ingestion?",
      a: "The system accepts standard comma-separated values (.csv) and Microsoft Excel workbooks (.xlsx, .xls). Files must include five specific column headers: observation_date, location, temperature, humidity, and rainfall."
    },
    {
      q: "Why does the system isolate invalid rows instead of silently deleting them?",
      a: "In real-world data science and academic evaluations, silently removing faulty rows with dropna() hides sensor errors and introduces selection bias. Our validation module segregates corrupt entries into a dedicated Quality Audit Log, allowing examiners to inspect exact failure causes (e.g. non-numeric strings, physical range violations)."
    },
    {
      q: "What are the physical validation limits enforced by the system?",
      a: "Temperature must fall between -50.0°C and 60.0°C. Relative humidity must be between 0.0% and 100.0%. Rainfall must be non-negative (>= 0.0 mm). Dates must parse into valid calendar dates (YYYY-MM-DD or DD-MM-YYYY). Duplicates across (date + location) are quarantined."
    },
    {
      q: "How does the Excel and PDF report generation work?",
      a: "The system leverages SheetJS to build a comprehensive 5-tab Excel workbook (.xlsx) containing executive summaries, cleaned records, monthly trends, station comparisons, and the audit log. It uses jsPDF for vector-styled printable executive dossiers."
    },
    {
      q: "Can this system run offline on a local laptop without internet access?",
      a: "Yes! The React frontend and its client data validation engine work 100% offline in modern browsers. The Python backend (Flask + MySQL) can be launched locally via 'python backend/app.py'."
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Documentation & User Manual
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">System User Guide</h1>
          </div>
        </div>
        <p className="text-sky-100 text-sm max-w-2xl mt-1">
          Complete reference guide covering dataset preparation, mathematical validation rules, interactive analytical tools, report downloads, and viva defense guidelines.
        </p>
      </div>

      {/* 4-Step Quick Start Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600" />
          1. Quick Start Workflow (4 Easy Steps)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">1</span>
            <h4 className="font-bold text-slate-900 text-sm">Upload File</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Drag and drop your historical weather CSV or Excel (.xlsx) file, or click <strong>Load Sample Weather Dataset</strong> for an instant demo.
            </p>
          </div>

          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">2</span>
            <h4 className="font-bold text-slate-900 text-sm">Audit Data</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The engine automatically audits rows across 7 integrity rules, computing the exact acceptance rate and logging anomalies.
            </p>
          </div>

          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">3</span>
            <h4 className="font-bold text-slate-900 text-sm">Analyze & Compare</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Explore temperature swings, humidity comfort indexes, rainfall totals, station comparisons, and interactive trends.
            </p>
          </div>

          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">4</span>
            <h4 className="font-bold text-slate-900 text-sm">Export Reports</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Download complete multi-sheet Excel files (.xlsx), executive PDF dossiers, or clean CSV datasets with a single click.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Schema Specification */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            2. Dataset Schema & Column Requirements
          </h3>
          <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            5 Required Columns
          </span>
        </div>
        <p className="text-xs text-slate-600">
          To ensure accurate statistical computations, uploaded files must feature these exact column names (case-insensitive):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Expected Type</th>
                <th className="py-2.5 px-3">Valid Range / Format</th>
                <th className="py-2.5 px-3">Example Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">observation_date</td>
                <td className="py-2.5 px-3">Date string</td>
                <td className="py-2.5 px-3">YYYY-MM-DD or DD-MM-YYYY</td>
                <td className="py-2.5 px-3 font-mono">2026-03-15</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">location</td>
                <td className="py-2.5 px-3">String</td>
                <td className="py-2.5 px-3">Non-empty station name</td>
                <td className="py-2.5 px-3 font-mono">Tirupati</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">temperature</td>
                <td className="py-2.5 px-3">Numeric (Float/Int)</td>
                <td className="py-2.5 px-3">-50.0°C to +60.0°C</td>
                <td className="py-2.5 px-3 font-mono">32.4</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">humidity</td>
                <td className="py-2.5 px-3">Numeric (Float/Int)</td>
                <td className="py-2.5 px-3">0.0% to 100.0%</td>
                <td className="py-2.5 px-3 font-mono">65.5</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-700">rainfall</td>
                <td className="py-2.5 px-3">Numeric (Float/Int)</td>
                <td className="py-2.5 px-3">&gt;= 0.0 mm</td>
                <td className="py-2.5 px-3 font-mono">12.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* The 7 Quality Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          3. The 7 Meteorological Data Quality Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 1: Completeness (Null Checks)</span>
            <span className="text-slate-600 text-[11px] block">
              Rejects any record where temperature, humidity, rainfall, location, or date is missing, empty, or NaN.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 2: Uniqueness (Duplicate Checks)</span>
            <span className="text-slate-600 text-[11px] block">
              Isolates duplicate observation entries logged on the identical date at the identical station.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 3: Chronological Integrity</span>
            <span className="text-slate-600 text-[11px] block">
              Validates that the observation_date conforms to standard calendar logic without invalid months or days.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 4: Numeric Coercion</span>
            <span className="text-slate-600 text-[11px] block">
              Ensures temperature, humidity, and rainfall are convertible into real numbers without corrupt text characters.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 5: Physical Temperature Boundaries</span>
            <span className="text-slate-600 text-[11px] block">
              Enforces thermodynamic realism (-50°C to +60°C). Any sensor glitch outside this interval is quarantined.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block">Rule 6: Atmospheric Humidity Limits</span>
            <span className="text-slate-600 text-[11px] block">
              Relative humidity must stay strictly between 0% and 100% saturation. Values above 100% or below 0% are rejected.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 md:col-span-2">
            <span className="font-bold text-slate-900 block">Rule 7: Non-Negative Precipitation</span>
            <span className="text-slate-600 text-[11px] block">
              Precipitation gauge readings cannot be negative. Negative values are flagged as calibration defects.
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-sky-600" />
          4. Frequently Asked Questions (FAQ) & Academic Viva Tips
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-3.5 bg-slate-50/60 hover:bg-sky-50 text-left font-bold text-xs text-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-sky-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
