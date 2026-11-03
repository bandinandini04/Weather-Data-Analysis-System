import React, { useState, useMemo } from "react";
import { ValidWeatherRecord } from "../types";
import {
  computeMonthlyAnalysis,
  computeDailyAnalysis,
  computeLocationAnalysis
} from "../utils/analysis";
import {
  MonthlyTempChart,
  MonthlyRainfallChart,
  MonthlyHumidityChart,
  TemperatureComparisonChart,
  DailyTempChart
} from "./Charts";
import { LineChart, BarChart3, MapPin, SlidersHorizontal } from "lucide-react";

interface VisualizationViewProps {
  records: ValidWeatherRecord[];
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ records }) => {
  const allLocations = useMemo(() => Array.from(new Set(records.map(r => r.location))).sort(), [records]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(allLocations);

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      if (selectedLocations.length > 1) {
        setSelectedLocations(selectedLocations.filter(l => l !== loc));
      }
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const selectAll = () => setSelectedLocations(allLocations);

  // Filter records
  const filtered = useMemo(() => {
    return records.filter(r => selectedLocations.includes(r.location));
  }, [records, selectedLocations]);

  const monthlyData = useMemo(() => computeMonthlyAnalysis(filtered), [filtered]);
  const dailyData = useMemo(() => computeDailyAnalysis(filtered), [filtered]);
  const locationData = useMemo(() => computeLocationAnalysis(filtered), [filtered]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        No dataset active. Please load or upload records from the Dashboard or Upload page to render meteorological charts.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📈 Interactive Weather Visualizations</h2>
          <p className="text-xs text-slate-500">
            Vector scientific charts with temperature profiles, precipitation bars, relative humidity curves, and station comparisons.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
          Synchronized to active filters
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-slate-700">Filter Visualization by Station:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={selectAll}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
              selectedLocations.length === allLocations.length
                ? "bg-sky-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Stations ({allLocations.length})
          </button>
          {allLocations.map(loc => {
            const isSel = selectedLocations.includes(loc);
            return (
              <button
                key={loc}
                onClick={() => toggleLocation(loc)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  isSel
                    ? "bg-sky-100 text-sky-900 border border-sky-300 font-semibold"
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Chart 1: Monthly Average Temperature Line Chart */}
        <MonthlyTempChart data={monthlyData} />

        {/* Grid: Rainfall & Humidity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 2: Monthly Rainfall Bar Chart */}
          <MonthlyRainfallChart data={monthlyData} />
          {/* Chart 3: Monthly Average Humidity Line Chart */}
          <MonthlyHumidityChart data={monthlyData} />
        </div>

        {/* Chart 4: Temperature Comparison Across Stations */}
        <TemperatureComparisonChart data={locationData} />

        {/* Chart 5: Daily Temperature Trends Timeline */}
        <DailyTempChart data={dailyData} />
      </div>
    </div>
  );
};
