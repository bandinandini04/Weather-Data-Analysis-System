import React, { useState, useMemo } from "react";
import { ValidWeatherRecord } from "../types";
import {
  MapPin,
  Calendar,
  Thermometer,
  CloudRain,
  Droplets,
  ArrowRightLeft,
  SlidersHorizontal,
  TrendingUp,
  Award,
  Layers,
  ChevronDown
} from "lucide-react";

interface ComparisonViewProps {
  records: ValidWeatherRecord[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ records }) => {
  const allLocations = useMemo(() => Array.from(new Set(records.map(r => r.location))).sort(), [records]);

  // Primary locations for direct 1-on-1 comparison
  const [stationA, setStationA] = useState<string>(allLocations[0] || "");
  const [stationB, setStationB] = useState<string>(allLocations[1] || allLocations[0] || "");

  // Date-wise comparison state
  const minDate = useMemo(() => records.length > 0 ? records.map(r => r.observation_date).sort()[0] : "", [records]);
  const maxDate = useMemo(() => records.length > 0 ? records.map(r => r.observation_date).sort().slice(-1)[0] : "", [records]);

  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: minDate,
    end: maxDate
  });

  // Calculate stats per location
  const locationStats = useMemo(() => {
    const map = new Map<string, {
      location: string;
      temps: number[];
      humidities: number[];
      rainfalls: number[];
      count: number;
    }>();

    records.forEach(r => {
      // Check date filter
      if (dateFilter.start && r.observation_date < dateFilter.start) return;
      if (dateFilter.end && r.observation_date > dateFilter.end) return;

      const cur = map.get(r.location) || {
        location: r.location,
        temps: [],
        humidities: [],
        rainfalls: [],
        count: 0
      };
      cur.temps.push(r.temperature);
      cur.humidities.push(r.humidity);
      cur.rainfalls.push(r.rainfall);
      cur.count += 1;
      map.set(r.location, cur);
    });

    return Array.from(map.values()).map(item => {
      const avgTemp = item.temps.reduce((a, b) => a + b, 0) / (item.temps.length || 1);
      const minTemp = Math.min(...item.temps);
      const maxTemp = Math.max(...item.temps);
      const avgHumidity = item.humidities.reduce((a, b) => a + b, 0) / (item.humidities.length || 1);
      const totalRainfall = item.rainfalls.reduce((a, b) => a + b, 0);
      const avgRainfall = totalRainfall / (item.rainfalls.length || 1);
      const maxRainfall = Math.max(...item.rainfalls);

      return {
        location: item.location,
        recordCount: item.count,
        avgTemp,
        minTemp,
        maxTemp,
        tempSpread: maxTemp - minTemp,
        avgHumidity,
        totalRainfall,
        avgRainfall,
        maxRainfall
      };
    });
  }, [records, dateFilter]);

  const statsA = useMemo(() => locationStats.find(l => l.location === stationA), [locationStats, stationA]);
  const statsB = useMemo(() => locationStats.find(l => l.location === stationB), [locationStats, stationB]);

  // Comparative Highlights
  const highestTempStation = useMemo(() => {
    if (locationStats.length === 0) return null;
    return [...locationStats].sort((a, b) => b.avgTemp - a.avgTemp)[0];
  }, [locationStats]);

  const wettestStation = useMemo(() => {
    if (locationStats.length === 0) return null;
    return [...locationStats].sort((a, b) => b.totalRainfall - a.totalRainfall)[0];
  }, [locationStats]);

  const mostHumidStation = useMemo(() => {
    if (locationStats.length === 0) return null;
    return [...locationStats].sort((a, b) => b.avgHumidity - a.avgHumidity)[0];
  }, [locationStats]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 max-w-4xl mx-auto">
        Please upload or load a dataset first to perform weather station comparisons.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-sky-600" />
            Location & Date-wise Weather Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Compare meteorological metrics between observation stations and observe variance across custom time windows.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-sky-600" />
          <span>Timeline: {dateFilter.start} to {dateFilter.end}</span>
        </div>
      </div>

      {/* Extreme Meteorological Station Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {highestTempStation && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Warmest Station</span>
              <Thermometer className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg font-black text-slate-900">{highestTempStation.location}</div>
            <div className="text-xs text-amber-600 font-bold mt-1">
              {highestTempStation.avgTemp.toFixed(1)}°C Mean Temp
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              High: {highestTempStation.maxTemp.toFixed(1)}°C • Low: {highestTempStation.minTemp.toFixed(1)}°C
            </div>
          </div>
        )}

        {wettestStation && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Wettest Station</span>
              <CloudRain className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-lg font-black text-slate-900">{wettestStation.location}</div>
            <div className="text-xs text-sky-600 font-bold mt-1">
              {wettestStation.totalRainfall.toFixed(1)} mm Cumulative
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Daily Avg: {wettestStation.avgRainfall.toFixed(1)} mm • Peak: {wettestStation.maxRainfall.toFixed(1)} mm
            </div>
          </div>
        )}

        {mostHumidStation && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Highest Humidity</span>
              <Droplets className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-lg font-black text-slate-900">{mostHumidStation.location}</div>
            <div className="text-xs text-indigo-600 font-bold mt-1">
              {mostHumidStation.avgHumidity.toFixed(1)}% Mean RH
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Atmospheric moisture level
            </div>
          </div>
        )}
      </div>

      {/* Head-to-Head Station Comparison Tool */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-sky-600" />
              Direct Station Head-to-Head Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Select any two stations to inspect comparative margins and meteorological differences
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Station A</label>
              <select
                value={stationA}
                onChange={(e) => setStationA(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs"
              >
                {allLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <span className="text-slate-400 font-bold mt-4">VS</span>
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Station B</label>
              <select
                value={stationB}
                onChange={(e) => setStationB(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs"
              >
                {allLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {statsA && statsB ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Station A Card */}
            <div className="p-5 bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                  Station A
                </span>
                <span className="text-slate-400 text-[11px]">{statsA.recordCount} Days</span>
              </div>
              <h4 className="text-xl font-black text-slate-900">{statsA.location}</h4>

              <div className="space-y-2 pt-2 border-t border-sky-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mean Temperature:</span>
                  <span className="font-bold text-slate-900">{statsA.avgTemp.toFixed(2)} °C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Temperature Bounds:</span>
                  <span className="font-medium text-slate-700">{statsA.minTemp.toFixed(1)}°C to {statsA.maxTemp.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mean Humidity:</span>
                  <span className="font-bold text-slate-900">{statsA.avgHumidity.toFixed(2)} %</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Rainfall:</span>
                  <span className="font-bold text-sky-700">{statsA.totalRainfall.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Peak Single-Day Rain:</span>
                  <span className="font-medium text-slate-700">{statsA.maxRainfall.toFixed(1)} mm</span>
                </div>
              </div>
            </div>

            {/* Differential Margin Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Variance & Differential (A - B)
                </span>
              </div>

              <div className="space-y-3 py-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500">Temperature Difference</div>
                  <div className={`text-base font-black ${statsA.avgTemp - statsB.avgTemp >= 0 ? "text-amber-600" : "text-sky-600"}`}>
                    {(statsA.avgTemp - statsB.avgTemp > 0 ? "+" : "")}{(statsA.avgTemp - statsB.avgTemp).toFixed(2)} °C
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {statsA.avgTemp > statsB.avgTemp ? `${statsA.location} is warmer` : `${statsB.location} is warmer`}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500">Rainfall Difference</div>
                  <div className={`text-base font-black ${statsA.totalRainfall - statsB.totalRainfall >= 0 ? "text-sky-600" : "text-slate-600"}`}>
                    {(statsA.totalRainfall - statsB.totalRainfall > 0 ? "+" : "")}{(statsA.totalRainfall - statsB.totalRainfall).toFixed(2)} mm
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {statsA.totalRainfall > statsB.totalRainfall ? `${statsA.location} received more rain` : `${statsB.location} received more rain`}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-[11px] text-slate-500">Humidity Margin</div>
                  <div className="text-base font-black text-slate-800">
                    {(statsA.avgHumidity - statsB.avgHumidity > 0 ? "+" : "")}{(statsA.avgHumidity - statsB.avgHumidity).toFixed(2)} %
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center">
                Calculated across common timeline
              </div>
            </div>

            {/* Station B Card */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Station B
                </span>
                <span className="text-slate-400 text-[11px]">{statsB.recordCount} Days</span>
              </div>
              <h4 className="text-xl font-black text-slate-900">{statsB.location}</h4>

              <div className="space-y-2 pt-2 border-t border-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mean Temperature:</span>
                  <span className="font-bold text-slate-900">{statsB.avgTemp.toFixed(2)} °C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Temperature Bounds:</span>
                  <span className="font-medium text-slate-700">{statsB.minTemp.toFixed(1)}°C to {statsB.maxTemp.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Mean Humidity:</span>
                  <span className="font-bold text-slate-900">{statsB.avgHumidity.toFixed(2)} %</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Rainfall:</span>
                  <span className="font-bold text-indigo-700">{statsB.totalRainfall.toFixed(2)} mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Peak Single-Day Rain:</span>
                  <span className="font-medium text-slate-700">{statsB.maxRainfall.toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            Select stations above to display head-to-head comparison.
          </div>
        )}
      </div>

      {/* Comprehensive Station Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Complete Station Comparison Matrix
          </h3>
          <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            {locationStats.length} Stations Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold">
                <th className="py-2.5 px-3">Station Location</th>
                <th className="py-2.5 px-3 text-right">Observation Days</th>
                <th className="py-2.5 px-3 text-right">Avg Temp (°C)</th>
                <th className="py-2.5 px-3 text-right">Temp Range (Min / Max)</th>
                <th className="py-2.5 px-3 text-right">Avg Humidity (%)</th>
                <th className="py-2.5 px-3 text-right">Total Rainfall (mm)</th>
                <th className="py-2.5 px-3 text-right">Max Rain (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locationStats.map(loc => (
                <tr key={loc.location} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    {loc.location}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">{loc.recordCount}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{loc.avgTemp.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-600 font-mono text-[11px]">
                    {loc.minTemp.toFixed(1)}° - {loc.maxTemp.toFixed(1)}° ({loc.tempSpread.toFixed(1)}° Δ)
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">{loc.avgHumidity.toFixed(2)}%</td>
                  <td className="py-3 px-3 text-right font-bold text-sky-700">{loc.totalRainfall.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{loc.maxRainfall.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
