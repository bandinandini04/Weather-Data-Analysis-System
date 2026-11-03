import React, { useState, useMemo } from "react";
import { ValidWeatherRecord } from "../types";
import {
  computeOverallStatistics,
  computeMonthlyAnalysis,
  computeDailyAnalysis,
  computeLocationAnalysis
} from "../utils/analysis";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Filter,
  RotateCcw,
  Calendar,
  MapPin
} from "lucide-react";

interface AnalysisViewProps {
  records: ValidWeatherRecord[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ records }) => {
  // Available filter options
  const allLocations = useMemo(() => Array.from(new Set(records.map(r => r.location))).sort(), [records]);
  const allYears = useMemo(() => Array.from(new Set(records.map(r => r.year))).sort(), [records]);
  const minDate = useMemo(() => records.length > 0 ? records.map(r => r.observation_date).sort()[0] : "", [records]);
  const maxDate = useMemo(() => records.length > 0 ? records.map(r => r.observation_date).sort().slice(-1)[0] : "", [records]);

  // Filter state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(minDate);
  const [endDate, setEndDate] = useState<string>(maxDate);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"monthly" | "daily" | "location">("monthly");

  const monthNames = [
    { num: 1, name: "Jan" }, { num: 2, name: "Feb" }, { num: 3, name: "Mar" },
    { num: 4, name: "Apr" }, { num: 5, name: "May" }, { num: 6, name: "Jun" },
    { num: 7, name: "Jul" }, { num: 8, name: "Aug" }, { num: 9, name: "Sep" },
    { num: 10, name: "Oct" }, { num: 11, name: "Nov" }, { num: 12, name: "Dec" }
  ];

  // Apply filters
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedLocations.length > 0 && !selectedLocations.includes(r.location)) return false;
      if (startDate && r.observation_date < startDate) return false;
      if (endDate && r.observation_date > endDate) return false;
      if (selectedMonths.length > 0 && !selectedMonths.includes(r.month)) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(r.year)) return false;
      return true;
    });
  }, [records, selectedLocations, startDate, endDate, selectedMonths, selectedYears]);

  // Derived statistics
  const stats = useMemo(() => computeOverallStatistics(filteredRecords), [filteredRecords]);
  const monthlyData = useMemo(() => computeMonthlyAnalysis(filteredRecords), [filteredRecords]);
  const dailyData = useMemo(() => computeDailyAnalysis(filteredRecords), [filteredRecords]);
  const locationData = useMemo(() => computeLocationAnalysis(filteredRecords), [filteredRecords]);

  const resetFilters = () => {
    setSelectedLocations([]);
    setStartDate(minDate);
    setEndDate(maxDate);
    setSelectedMonths([]);
    setSelectedYears([]);
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleMonth = (mNum: number) => {
    setSelectedMonths(prev =>
      prev.includes(mNum) ? prev.filter(m => m !== mNum) : [...prev, mNum]
    );
  };

  const toggleYear = (y: number) => {
    setSelectedYears(prev =>
      prev.includes(y) ? prev.filter(item => item !== y) : [...prev, y]
    );
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        No dataset active. Please load or upload records from the Dashboard or Upload page.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">🔬 Meteorological Data Analysis</h2>
          <p className="text-xs text-slate-500">
            Statistical computations across temperature, humidity, and precipitation with multi-dimensional filtering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 text-sky-800 rounded-full">
            {filteredRecords.length.toLocaleString()} matching records (of {records.length.toLocaleString()})
          </span>
          {(selectedLocations.length > 0 || selectedMonths.length > 0 || selectedYears.length > 0 || startDate !== minDate || endDate !== maxDate) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-sky-600" />
          Interactive Query Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Location Multi-Select */}
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              Weather Station / Location
            </label>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 border border-slate-200 rounded-lg bg-slate-50">
              {allLocations.map(loc => {
                const isSelected = selectedLocations.includes(loc);
                return (
                  <button
                    key={loc}
                    onClick={() => toggleLocation(loc)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Observation Date Range
            </label>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 w-8">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 w-8">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Month Multi-Select */}
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Months (Seasonal Filter)
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50">
              {monthNames.map(m => {
                const isSelected = selectedMonths.includes(m.num);
                return (
                  <button
                    key={m.num}
                    onClick={() => toggleMonth(m.num)}
                    className={`py-0.5 text-center rounded-sm text-[10px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Year Multi-Select */}
          <div>
            <label className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Years
            </label>
            <div className="flex flex-wrap gap-1 p-1 border border-slate-200 rounded-lg bg-slate-50">
              {allYears.map(yr => {
                const isSelected = selectedYears.includes(yr);
                return (
                  <button
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Meteorological Analysis Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Temperature Card */}
        <div className="bg-white rounded-2xl border-t-4 border-t-orange-500 border-x border-b border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Thermometer className="w-4 h-4 text-orange-500" />
              Temperature Analysis
            </h3>
            <span className="text-[11px] bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-full">°C</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Average Temperature:</span>
              <span className="text-xl font-bold text-slate-800">{stats.avg_temp.toFixed(2)} °C</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Minimum Temperature:</span>
              <span className="text-sm font-semibold text-sky-600">{stats.min_temp.toFixed(2)} °C</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Maximum Temperature:</span>
              <span className="text-sm font-semibold text-orange-600">{stats.max_temp.toFixed(2)} °C</span>
            </div>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="bg-white rounded-2xl border-t-4 border-t-cyan-500 border-x border-b border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Droplets className="w-4 h-4 text-cyan-500" />
              Humidity Analysis
            </h3>
            <span className="text-[11px] bg-cyan-50 text-cyan-700 font-semibold px-2 py-0.5 rounded-full">%</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Average Humidity:</span>
              <span className="text-xl font-bold text-slate-800">{stats.avg_humidity.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Minimum Humidity:</span>
              <span className="text-sm font-semibold text-slate-700">{stats.min_humidity.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Maximum Humidity:</span>
              <span className="text-sm font-semibold text-cyan-600">{stats.max_humidity.toFixed(2)} %</span>
            </div>
          </div>
        </div>

        {/* Rainfall Card */}
        <div className="bg-white rounded-2xl border-t-4 border-t-sky-600 border-x border-b border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <CloudRain className="w-4 h-4 text-sky-600" />
              Rainfall Analysis
            </h3>
            <span className="text-[11px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-full">mm</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Total Precipitation:</span>
              <span className="text-xl font-bold text-sky-700">{stats.total_rainfall.toFixed(2)} mm</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
              <span className="text-xs text-slate-500">Average Daily Rain:</span>
              <span className="text-sm font-semibold text-slate-700">{stats.avg_rainfall.toFixed(2)} mm</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Peak Single-Day Rain:</span>
              <span className="text-sm font-semibold text-sky-600">{stats.max_rainfall.toFixed(2)} mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Aggregation Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("monthly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "monthly" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📅 Monthly Aggregation
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "daily" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📆 Daily Timeline
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === "location" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📍 Station / Location Breakdown
            </button>
          </div>
        </div>

        {/* Monthly Table */}
        {activeTab === "monthly" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Avg Temp (°C)</th>
                  <th className="py-2.5 px-3">Min / Max (°C)</th>
                  <th className="py-2.5 px-3">Avg Humidity (%)</th>
                  <th className="py-2.5 px-3">Total Rainfall (mm)</th>
                  <th className="py-2.5 px-3">Daily Avg Rain</th>
                  <th className="py-2.5 px-3 text-right">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyData.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.period}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{m.avg_temp} °C</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.min_temp}° / {m.max_temp}°</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.avg_humidity} %</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">{m.total_rainfall} mm</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.avg_rainfall} mm</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{m.record_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Daily Table */}
        {activeTab === "daily" && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-y border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Observation Date</th>
                  <th className="py-2.5 px-3">Daily Mean Temp</th>
                  <th className="py-2.5 px-3">Min / Max Temp</th>
                  <th className="py-2.5 px-3">Daily Humidity</th>
                  <th className="py-2.5 px-3">Daily Total Rain</th>
                  <th className="py-2.5 px-3 text-right">Stations Ingested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{d.observation_date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{d.avg_temp} °C</td>
                    <td className="py-2.5 px-3 text-slate-600">{d.min_temp}° / {d.max_temp}°</td>
                    <td className="py-2.5 px-3 text-slate-700">{d.avg_humidity} %</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">{d.total_rainfall} mm</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{d.location_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Location Table */}
        {activeTab === "location" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Location / Station</th>
                  <th className="py-2.5 px-3">Total Records</th>
                  <th className="py-2.5 px-3">Mean Temp (°C)</th>
                  <th className="py-2.5 px-3">Temperature Bounds</th>
                  <th className="py-2.5 px-3">Mean Humidity</th>
                  <th className="py-2.5 px-3">Cumulative Rain</th>
                  <th className="py-2.5 px-3 text-right">Peak Rain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locationData.map((loc, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{loc.location}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{loc.record_count}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{loc.avg_temp} °C</td>
                    <td className="py-2.5 px-3 text-slate-600">{loc.min_temp}° to {loc.max_temp}°</td>
                    <td className="py-2.5 px-3 text-slate-700">{loc.avg_humidity} %</td>
                    <td className="py-2.5 px-3 font-bold text-sky-700">{loc.total_rainfall} mm</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{loc.max_rainfall} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
