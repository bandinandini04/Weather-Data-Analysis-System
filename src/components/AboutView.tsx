import React from "react";
import {
  BookOpen,
  Target,
  Cpu,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  User,
  Users,
  Building2,
  Calendar,
  Award,
  Upload,
  BarChart3,
  CalendarDays,
  LineChart,
  FileDown,
  Database,
  Code2,
  Table,
  Check
} from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Title Header with Official Brand Logo */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 rounded-2xl p-8 text-white shadow-md flex flex-col md:flex-row items-center gap-6">
        <img
          src="/logo.png"
          alt="Weather Data Analysis System Logo"
          className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white p-2 shadow-lg object-contain shrink-0 border-2 border-white/60"
        />
        <div>
          <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            B.Tech Computer Science & Engineering • Final Year / Capstone Project
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Weather Data Analysis System</h1>
          <p className="text-sky-100 text-sm md:text-base mt-1 font-medium">
            Analyze Historical Weather Data with Python • Analyze • Visualize • Understand
          </p>
        </div>
      </div>

      {/* SECTION 1: Project Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            1. Project Overview
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            System Introduction
          </span>
        </div>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            The <strong>Weather Data Analysis System</strong> is a comprehensive, professional data analytics platform engineered to process, audit, and visualize historical meteorological observations. In modern environmental studies and data engineering, raw weather data gathered from observation stations often suffers from missing readings, formatting errors, or recording anomalies that corrupt downstream evaluations.
          </p>
          <p>
            <strong>Why it was developed:</strong> The system was created to eliminate manual spreadsheet calculations, prevent human errors, and provide an automated, transparent pipeline for examining climate trends. Rather than speculating on future forecasts, this system focuses strictly on <em>Exploratory Data Analysis (EDA)</em>, ensuring mathematical rigor and data integrity.
          </p>
          <p>
            <strong>How it helps users:</strong> Users can upload raw CSV datasets, execute automatic algorithmic validation, analyze statistical indicators (temperatures, humidity, rainfall), identify seasonal weather patterns through interactive charts, and instantly download comprehensive executive reports in PDF and CSV formats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="font-bold text-sky-900 mb-0.5">Empirical Historical Data</div>
            <div className="text-slate-600 text-[11px]">Strictly analyzes factual recorded weather observations without speculative simulations.</div>
          </div>
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="font-bold text-sky-900 mb-0.5">Zero Silent Deletion</div>
            <div className="text-slate-600 text-[11px]">Validates every record transparently, isolating errors with detailed audit explanations.</div>
          </div>
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="font-bold text-sky-900 mb-0.5">Visual Decision Support</div>
            <div className="text-slate-600 text-[11px]">Transforms tabular records into interactive charts and downloadable academic reports.</div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Project Objectives */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            2. Project Objectives
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            Core Goals
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Upload Historical Weather Data:</strong>
              Seamlessly import historical observations through structured CSV files with automated schema verification and sample template support.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Validate Weather Records:</strong>
              Apply algorithmic rules to identify missing values, duplicates, non-numeric values, and physical boundary violations without silent data loss.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Analyze Temperature, Humidity, and Rainfall:</strong>
              Calculate comprehensive statistical aggregates including averages, minimums, maximums, and cumulative rainfall totals.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Generate Daily and Monthly Weather Summaries:</strong>
              Aggregate data chronologically to evaluate daily temperature swings, monthly precipitation volumes, and station comparative metrics.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Compare Weather Patterns Using Visualizations:</strong>
              Present dynamic charts for monthly temperature trends, rainfall distribution, and humidity curves to uncover seasonal variations.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-900 font-semibold mb-0.5">Generate Downloadable Analysis Reports:</strong>
              Produce print-ready, formal PDF analytical dossiers and structured clean CSV files for academic archiving and viva demonstrations.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Technologies Used */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            3. Technologies Used
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            Technology Stack
          </span>
        </div>
        <p className="text-xs text-slate-500">
          The system leverages industry-standard technologies for data science, persistent storage, and reactive user interfaces:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Python */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">Python</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Core Backend</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Primary language for meteorological data processing, algorithm execution, and statistical validation.
            </div>
          </div>

          {/* Pandas */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">Pandas</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Data Analysis</span>
            </div>
            <div className="text-[11px] text-slate-600">
              High-performance DataFrame operations, CSV parsing, data filtering, and time-series aggregation.
            </div>
          </div>

          {/* NumPy */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">NumPy</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Numerics</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Fast array processing, vector mathematical calculations, and empirical statistical summaries.
            </div>
          </div>

          {/* Matplotlib */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">Matplotlib</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Visualization</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Statistical plotting, temperature trend line graphs, and meteorological bar chart generation.
            </div>
          </div>

          {/* MySQL */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">MySQL</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Database</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Relational database management for storing persistent weather observations and audit records.
            </div>
          </div>

          {/* React */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">React</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Frontend</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Component-based modern web interface providing reactive dashboards, state management, and smooth navigation.
            </div>
          </div>

          {/* TypeScript */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 text-sm">TypeScript</span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-1.5 py-0.5 rounded">Type Safety</span>
            </div>
            <div className="text-[11px] text-slate-600">
              Typed JavaScript ensuring robust contract validation, code maintainability, and clean software architecture.
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Key Modules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            4. Key Modules
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            System Architecture
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Module 1: Data Upload */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Upload className="w-4 h-4" />
              <span>Data Upload Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Handles the ingestion of historical weather observations from CSV files. Provides drag-and-drop file uploading, file header verification, row count inspection, and a downloadable standard template.
            </p>
          </div>

          {/* Module 2: Data Validation */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Validation Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Performs strict automated auditing against 7 physical rules. Detects missing values, duplicates, invalid dates, out-of-bounds temperatures, humidity violations, and negative rainfall without silent deletions.
            </p>
          </div>

          {/* Module 3: Weather Data Analysis */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Weather Data Analysis Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Executes mathematical computations on accepted records. Computes mean, minimum, and maximum values for temperature and humidity, as well as cumulative rainfall and daily/monthly grouping.
            </p>
          </div>

          {/* Module 4: Data Visualization */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <LineChart className="w-4 h-4" />
              <span>Data Visualization Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Renders responsive, interactive charts including monthly temperature trends, rainfall distribution bar charts, and humidity curves to uncover seasonal patterns across multiple locations.
            </p>
          </div>

          {/* Module 5: Records Management */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Table className="w-4 h-4" />
              <span>Records Management Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Provides an interactive data table with live keyword search, station/location filtering, date-based sorting, pagination, and inspection of both valid datasets and flagged rejection logs.
            </p>
          </div>

          {/* Module 6: Report Generation */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <FileDown className="w-4 h-4" />
              <span>Report Generation Module</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Compiles analytical metrics, data quality logs, and summary findings into downloadable formats. Users can export structured CSV files or generate formal print-ready PDF reports.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: Project Team */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            5. Project Team
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            6 Team Members
          </span>
        </div>

        {/* Team Members Grid - 6 Equal Members */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            "Nandini",
            "Shanthi",
            "Mohana Priya",
            "Kavya Reddy",
            "Haripriya",
            "Prasanth"
          ].map((name) => (
            <div
              key={name}
              className="p-3.5 bg-gradient-to-br from-sky-50/70 to-slate-50/70 border border-sky-100 rounded-xl space-y-2 text-center shadow-2xs hover:border-sky-300 transition-colors"
            >
              <div className="w-9 h-9 mx-auto rounded-full bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight">
                  {name}
                </div>
                <div className="text-[10px] text-sky-700 font-medium mt-1">
                  Team Member
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Common Academic Details */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-700">
                <Award className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                Computer Science and Engineering (CSE)
              </div>
              <div className="text-[11px] text-slate-500">B.Tech Programme</div>
            </div>

            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-700">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">College</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                Mohan Babu University
              </div>
              <div className="text-[11px] text-slate-500">University Campus</div>
            </div>

            <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sky-700">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Year</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                2026–2027
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">Capstone Project</div>
            </div>
          </div>
        </div>
      </div>

      {/* College Viva Questions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sky-600" />
            College Viva Examination Preparation Guide
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            Examination Guide
          </span>
        </div>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Q1: Why is this system not doing weather forecasting?</div>
            <div className="text-slate-600 leading-relaxed">
              A: Weather forecasting requires meteorological physical simulation (barometric pressure, wind vectors, Doppler radar) or complex time-series neural networks (LSTMs). This system is strictly an <strong>Exploratory Data Analysis (EDA) and Quality Auditing System</strong> for empirical historical observations, preventing fraudulent forecast simulations.
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Q2: How does the system handle corrupted or out-of-bounds readings?</div>
            <div className="text-slate-600 leading-relaxed">
              A: Standard scripts use destructive silent cleaning like <code>dropna()</code>. Our system implements a dedicated validation engine in <code>modules/data_validation.py</code> which tests 7 specific physical rules, isolates invalid rows in a separate dataframe, and logs human-readable rejection reasons (e.g., <em>"Temperature -85°C out of realistic range"</em>).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
