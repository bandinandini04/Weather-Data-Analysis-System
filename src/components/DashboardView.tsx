import React, { useMemo } from "react";
import {
  ValidWeatherRecord,
  ValidationSummary,
  OverallStatistics,
  MonthlyAggregation
} from "../types";
import {
  MonthlyTempChart,
  MonthlyRainfallChart,
  MonthlyHumidityChart
} from "./Charts";
import { generateWeatherInsights } from "../utils/insights";
import {
  CloudSun,
  Thermometer,
  Droplets,
  CloudRain,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  FileSpreadsheet
} from "lucide-react";

interface DashboardViewProps {
  stats: OverallStatistics;
  validationSummary: ValidationSummary;
  validRecords: ValidWeatherRecord[];
  monthlyData: MonthlyAggregation[];
  datasetName: string;
  onNavigateToUpload: () => void;
  onLoadSample: () => void;
  onNavigateToComparison?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  validationSummary,
  validRecords,
  monthlyData,
  datasetName,
  onNavigateToUpload,
  onLoadSample,
  onNavigateToComparison
}) => {
  const insights = useMemo(
    () => generateWeatherInsights(validRecords, stats, monthlyData),
    [validRecords, stats, monthlyData]
  );

  if (validationSummary.total_records === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center">
        <img
          src="/logo.png"
          alt="Weather Data Analysis System Logo"
          className="w-24 h-24 rounded-2xl bg-white p-2 border border-slate-200 shadow-sm mx-auto mb-6 object-contain"
        />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Weather Dataset Uploaded Yet</h2>
        <p className="text-slate-600 max-w-lg mx-auto mb-8 text-sm">
          Welcome to the <strong>Weather Data Analysis System</strong>. To view statistical summaries, validation logs, and meteorological graphs, upload your historical CSV or Excel weather dataset or test with our built-in demonstration dataset.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLoadSample}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition-colors shadow-xs flex items-center gap-2 text-sm cursor-pointer"
          >
            <Database className="w-4 h-4" />
            Load Built-in Sample Dataset (90+ Observations)
          </button>
          <button
            onClick={onNavigateToUpload}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors text-sm flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Upload CSV or Excel
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const recentRecords = [...validRecords].sort((a, b) => b.observation_date.localeCompare(a.observation_date)).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Active dataset banner */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded-sm">
            Active Dataset
          </span>
          <span className="font-bold text-slate-800">{datasetName}</span>
          <span className="text-slate-400">•</span>
          <span>Coverage: <strong>{stats.start_date}</strong> to <strong>{stats.end_date}</strong></span>
          <span className="text-slate-400">•</span>
          <span><strong>{stats.unique_locations}</strong> Weather Stations</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {validationSummary.accepted_records} Valid ({validationSummary.acceptance_rate_pct.toFixed(1)}%)
          </span>
          {validationSummary.rejected_records > 0 && (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {validationSummary.rejected_records} Audited Anomalies
            </span>
          )}
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Records */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
            Total Records
          </div>
          <div className="text-2xl font-black text-slate-900">
            {validationSummary.total_records.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Raw observations
          </div>
        </div>

        {/* Avg Temperature */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Avg Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.avg_temp.toFixed(1)} <span className="text-sm font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Min {stats.min_temp.toFixed(1)}° • Max {stats.max_temp.toFixed(1)}°
          </div>
        </div>

        {/* Avg Humidity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Avg Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.avg_humidity.toFixed(1)} <span className="text-sm font-normal text-slate-500">%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Atmospheric moisture
          </div>
        </div>

        {/* Total Rainfall */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Total Rain</span>
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.total_rainfall.toFixed(1)} <span className="text-sm font-normal text-slate-500">mm</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Peak {stats.max_rainfall.toFixed(1)} mm/day
          </div>
        </div>

        {/* Valid Records */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 mb-1 flex items-center justify-between">
            <span>Valid Records</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {validationSummary.accepted_records.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {validationSummary.acceptance_rate_pct.toFixed(1)}% verified
          </div>
        </div>

        {/* Invalid Records */}
        <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-xs bg-rose-50/20">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-rose-800 mb-1 flex items-center justify-between">
            <span>Invalid Records</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">
            {validationSummary.rejected_records.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-medium">
            Isolated & audited
          </div>
        </div>
      </div>

      {/* Algorithmic Weather Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Empirical Weather Insights & Pattern Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Data-driven meteorological findings deduced from active validated observations
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
              {insights.length} Deductions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-sky-50/50 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {ins.category === "thermal" && <Thermometer className="w-4 h-4 text-amber-500" />}
                    {ins.category === "rainfall" && <CloudRain className="w-4 h-4 text-sky-600" />}
                    {ins.category === "humidity" && <Droplets className="w-4 h-4 text-indigo-500" />}
                    {ins.category === "pattern" && <Layers className="w-4 h-4 text-purple-500" />}
                    {ins.title}
                  </span>
                  {ins.value && (
                    <span className="text-[11px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {ins.value}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTempChart data={monthlyData} />
        <MonthlyRainfallChart data={monthlyData} />
      </div>

      {/* Humidity Chart Full Width */}
      <MonthlyHumidityChart data={monthlyData} />

      {/* Recent Weather Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-800">📋 Recent Weather Records</h4>
            <p className="text-xs text-slate-500">10 most recent verified observations from dataset</p>
          </div>
          <div className="flex items-center gap-3">
            {onNavigateToComparison && (
              <button
                onClick={onNavigateToComparison}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
              >
                Compare Stations →
              </button>
            )}
            <button
              onClick={onNavigateToUpload}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
            >
              Manage Dataset →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Location / Station</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Rainfall</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{r.observation_date}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{r.location}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-semibold">{r.temperature.toFixed(1)} °C</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.humidity.toFixed(1)} %</td>
                  <td className="py-2.5 px-3 text-slate-700">{r.rainfall.toFixed(1)} mm</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                      Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
