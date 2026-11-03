import React, { useState, useEffect, useCallback } from "react";
import {
  ValidWeatherRecord,
  InvalidWeatherRecord,
  ValidationSummary,
  OverallStatistics,
  MonthlyAggregation,
  UserProfile
} from "./types";
import { validateWeatherData } from "./utils/validation";
import { computeOverallStatistics, computeMonthlyAnalysis } from "./utils/analysis";
import { RAW_SAMPLE_WEATHER_CSV } from "./sampleData";
import { weatherApi, BackendHealthResponse } from "./services/api";
import { authService } from "./services/auth";

// Views
import { DashboardView } from "./components/DashboardView";
import { UploadView } from "./components/UploadView";
import { AnalysisView } from "./components/AnalysisView";
import { ComparisonView } from "./components/ComparisonView";
import { VisualizationView } from "./components/VisualizationView";
import { RecordsView } from "./components/RecordsView";
import { ReportsView } from "./components/ReportsView";
import { UserDashboardView } from "./components/UserDashboardView";
import { HelpView } from "./components/HelpView";
import { AboutView } from "./components/AboutView";
import { PythonCodeView } from "./components/PythonCodeView";
import { AuthModal } from "./components/AuthModal";

// Icons
import {
  LayoutDashboard,
  UploadCloud,
  LineChart,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Info,
  Code2,
  Database,
  CloudSun,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Server,
  RefreshCw,
  ExternalLink,
  ArrowRightLeft,
  User,
  HelpCircle,
  Sparkles,
  LogIn,
  RotateCcw
} from "lucide-react";

type PageId =
  | "dashboard"
  | "upload"
  | "analysis"
  | "comparison"
  | "visualization"
  | "records"
  | "reports"
  | "user-dashboard"
  | "help"
  | "about"
  | "python";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Authentication & Active User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  // Backend Connectivity State
  const [backendStatus, setBackendStatus] = useState<{
    isConnected: boolean;
    checking: boolean;
    data: BackendHealthResponse | null;
    error: string | null;
  }>({
    isConnected: false,
    checking: true,
    data: null,
    error: null
  });

  // Core Data States
  const [validRecords, setValidRecords] = useState<ValidWeatherRecord[]>([]);
  const [invalidRecords, setInvalidRecords] = useState<InvalidWeatherRecord[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary>({
    total_records: 0,
    accepted_records: 0,
    rejected_records: 0,
    acceptance_rate_pct: 0,
    missing_values_count: 0,
    duplicates_count: 0,
    invalid_dates_count: 0,
    non_numeric_count: 0,
    out_of_range_temp_count: 0,
    out_of_range_humidity_count: 0,
    negative_rainfall_count: 0
  });
  const [stats, setStats] = useState<OverallStatistics>({
    record_count: 0,
    avg_temp: 0,
    min_temp: 0,
    max_temp: 0,
    avg_humidity: 0,
    min_humidity: 0,
    max_humidity: 0,
    total_rainfall: 0,
    avg_rainfall: 0,
    max_rainfall: 0,
    start_date: "N/A",
    end_date: "N/A",
    unique_locations: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyAggregation[]>([]);
  const [datasetName, setDatasetName] = useState<string>("None");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Check Flask Backend Health
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, checking: true, error: null }));
    const result = await weatherApi.checkHealth();
    if (result.isConnected && result.data) {
      setBackendStatus({
        isConnected: true,
        checking: false,
        data: result.data,
        error: null
      });

      // If backend has active data, synchronize with it
      try {
        const dash = await weatherApi.getDashboard();
        if (dash.has_data && dash.dataset_name) {
          setDatasetName(dash.dataset_name);
        }
      } catch (err) {
        console.warn("Could not sync dashboard from Flask:", err);
      }
    } else {
      setBackendStatus({
        isConnected: false,
        checking: false,
        data: null,
        error: result.error || "Flask server offline"
      });
    }
  }, []);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  // Load dataset handler (supports both Flask API upload and client fallback)
  const handleLoadDataset = async (fileOrText: File | string, name: string) => {
    setIsProcessing(true);
    let csvString = typeof fileOrText === "string" ? fileOrText : "";

    // If a File object was passed, read text for local state mirror
    if (typeof fileOrText !== "string") {
      try {
        csvString = await fileOrText.text();
      } catch (e) {
        console.error("Error reading file text:", e);
      }
    }

    // Try posting to Flask backend if online
    if (backendStatus.isConnected) {
      try {
        await weatherApi.uploadCSV(fileOrText, name);
      } catch (apiErr) {
        console.warn("Flask upload failed, falling back to local processing:", apiErr);
      }
    }

    // Process locally to update responsive UI instantly
    if (csvString) {
      const { validRecords: valid, invalidRecords: invalid, summary } = validateWeatherData(csvString);
      const overallStats = computeOverallStatistics(valid);
      const monthly = computeMonthlyAnalysis(valid);

      setValidRecords(valid);
      setInvalidRecords(invalid);
      setValidationSummary(summary);
      setStats(overallStats);
      setMonthlyData(monthly);
      setDatasetName(name);

      // Auto-save to current user's archive library
      if (currentUser) {
        authService.saveUserDataset({
          userId: currentUser.id,
          datasetName: name,
          recordCount: summary.total_records,
          validCount: summary.accepted_records,
          invalidCount: summary.rejected_records,
          startDate: overallStats.start_date,
          endDate: overallStats.end_date,
          locationsCount: overallStats.unique_locations,
          csvContent: csvString
        });
      }
    }
    setIsProcessing(false);
  };

  // Preload built-in sample data on first launch
  useEffect(() => {
    try {
      handleLoadDataset(RAW_SAMPLE_WEATHER_CSV, "sample_weather.csv (Automatic Demo Load)");
    } catch (e) {
      console.error("Failed to load sample weather data", e);
    }
  }, []);

  const handleLoadSample = async () => {
    if (backendStatus.isConnected) {
      try {
        await weatherApi.resetSample();
      } catch (e) {
        console.warn("Flask sample reset warning:", e);
      }
    }
    handleLoadDataset(RAW_SAMPLE_WEATHER_CSV, "sample_weather.csv");
    setCurrentPage("dashboard");
  };

  // Navigation Items
  const navItems = [
    { id: "dashboard" as PageId, label: "Dashboard", icon: LayoutDashboard },
    { id: "upload" as PageId, label: "Upload Data (CSV/Excel)", icon: UploadCloud },
    { id: "analysis" as PageId, label: "Data Analysis", icon: LineChart },
    { id: "comparison" as PageId, label: "Station Comparison", icon: ArrowRightLeft },
    { id: "visualization" as PageId, label: "Data Visualization", icon: BarChart3 },
    { id: "records" as PageId, label: "Weather Records", icon: FileSpreadsheet },
    { id: "reports" as PageId, label: "Reports & Export", icon: FileText },
    { id: "user-dashboard" as PageId, label: "User Dashboard", icon: User },
    { id: "help" as PageId, label: "Help & User Guide", icon: HelpCircle },
    { id: "about" as PageId, label: "About Project", icon: Info },
    { id: "python" as PageId, label: "Full-Stack Source & ZIP", icon: Code2, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-sky-700 text-white p-4 flex items-center justify-between shadow-xs sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-7 h-7 rounded-lg bg-white object-contain p-0.5 shadow-2xs"
          />
          <span className="font-bold text-sm tracking-tight">Weather Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => setCurrentPage("user-dashboard")}
              className="w-7 h-7 rounded-full bg-white text-sky-800 font-bold text-xs flex items-center justify-center border border-white/60"
            >
              {currentUser.name.charAt(0)}
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-semibold text-white"
            >
              Login
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-sky-600 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-40 transition-transform md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Brand Header with Official Logo */}
          <div className="px-2 pt-1 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800">
                B.Tech CSE Capstone
              </span>
              <span className="text-[10px] text-slate-400 font-mono">v2.5 Pro</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Weather Data Analysis System Logo"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 object-contain p-0.5 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                  Weather Analytics
                </h1>
                <p className="text-[10px] text-sky-600 font-semibold tracking-tight truncate">
                  Analyze • Visualize • Understand
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Mini Badge in Sidebar */}
          {currentUser ? (
            <div
              onClick={() => { setCurrentPage("user-dashboard"); setMobileMenuOpen(false); }}
              className="p-2.5 bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-100 rounded-xl flex items-center justify-between cursor-pointer hover:border-sky-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${currentUser.avatarColor || "from-sky-500 to-indigo-600"} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentUser.role}</div>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold text-sky-700 bg-sky-200/60 px-1.5 py-0.5 rounded">
                Profile
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-sky-600 text-white shadow-xs"
                      : item.highlight
                      ? "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : item.highlight ? "text-sky-600" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Badges */}
        <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
          {/* Backend Status Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <Server className={`w-3.5 h-3.5 ${backendStatus.isConnected ? "text-emerald-500" : "text-amber-500"}`} />
                <span className={backendStatus.isConnected ? "text-emerald-700" : "text-slate-700"}>
                  {backendStatus.isConnected ? "Flask API Online" : "Standalone Engine"}
                </span>
              </div>
              <button
                onClick={checkBackendHealth}
                disabled={backendStatus.checking}
                title="Refresh Flask API health connection"
                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${backendStatus.checking ? "animate-spin text-sky-600" : ""}`} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {backendStatus.isConnected
                ? "Connected to Flask REST API"
                : "Flask offline (Run `python backend/app.py`)"}
            </p>
          </div>

          {/* Database Mode Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Database className="w-3.5 h-3.5 text-sky-500" />
              <span>
                {backendStatus.data?.database.connected ? "MySQL Database Mode" : "CSV & Excel Active"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              {backendStatus.data?.database.connected
                ? `MySQL Connected: ${backendStatus.data.database.database}`
                : "MySQL optional • Client-side ready"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 rounded-2xl p-6 text-white mb-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Weather Data Analysis System Logo"
                className="w-16 h-16 rounded-2xl bg-white p-1 shadow-md object-contain shrink-0 hidden sm:block border-2 border-white/60"
              />
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-md">
                    B.Tech CSE Capstone Project • Production Ready
                  </span>
                  {backendStatus.isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Flask API Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-200 border border-amber-400/30">
                      Standalone Active (Flask ready on port 5000)
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">Weather Data Analysis System</h1>
                <p className="text-sky-100 text-xs md:text-sm mt-0.5 font-medium">
                  Analyze Historical Weather Data with Python Flask & React • Analyze • Visualize • Understand
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="px-3.5 py-2 bg-sky-800/80 hover:bg-sky-900 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-sky-200" />
                Reload Sample
              </button>

              {currentUser ? (
                <button
                  onClick={() => setCurrentPage("user-dashboard")}
                  className="px-3.5 py-2 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span>{currentUser.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3.5 py-2 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-600" />
                  Sign In
                </button>
              )}

              <button
                onClick={() => setCurrentPage("python")}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-white" />
                Source & ZIP
              </button>
            </div>
          </div>
        </div>

        {/* View Router */}
        {currentPage === "dashboard" && (
          <DashboardView
            stats={stats}
            validationSummary={validationSummary}
            validRecords={validRecords}
            monthlyData={monthlyData}
            datasetName={datasetName}
            onNavigateToUpload={() => setCurrentPage("upload")}
            onLoadSample={handleLoadSample}
            onNavigateToComparison={() => setCurrentPage("comparison")}
          />
        )}

        {currentPage === "upload" && (
          <UploadView
            onProcessCSV={(text, name) => handleLoadDataset(text, name)}
            onLoadSample={handleLoadSample}
            validationSummary={validationSummary}
            invalidRecords={invalidRecords}
            activeDatasetName={datasetName}
          />
        )}

        {currentPage === "analysis" && (
          <AnalysisView records={validRecords} />
        )}

        {currentPage === "comparison" && (
          <ComparisonView records={validRecords} />
        )}

        {currentPage === "visualization" && (
          <VisualizationView records={validRecords} />
        )}

        {currentPage === "records" && (
          <RecordsView
            validRecords={validRecords}
            invalidRecords={invalidRecords}
          />
        )}

        {currentPage === "reports" && (
          <ReportsView
            validRecords={validRecords}
            invalidRecords={invalidRecords}
            monthlyData={monthlyData}
            stats={stats}
            validationSummary={validationSummary}
            datasetName={datasetName}
          />
        )}

        {currentPage === "user-dashboard" && (
          <UserDashboardView
            currentUser={currentUser}
            stats={stats}
            validationSummary={validationSummary}
            activeDatasetName={datasetName}
            onLoadDatasetContent={(csv, name) => handleLoadDataset(csv, name)}
            onNavigate={(page) => setCurrentPage(page)}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentPage === "help" && (
          <HelpView />
        )}

        {currentPage === "about" && (
          <AboutView />
        )}

        {currentPage === "python" && (
          <PythonCodeView />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}
