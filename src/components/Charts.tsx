import React, { useState } from "react";
import { MonthlyAggregation, DailyAggregation, LocationAggregation } from "../types";

// 1. Monthly Average Temperature Line Chart
export const MonthlyTempChart: React.FC<{ data: MonthlyAggregation[] }> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">No monthly temperature records available.</div>;
  }

  const height = 280;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };
  const width = Math.max(500, data.length * 60);

  // Compute min and max across all temperatures
  const allTemps = data.flatMap(d => [d.min_temp, d.avg_temp, d.max_temp]);
  const minVal = Math.floor(Math.min(...allTemps) - 2);
  const maxVal = Math.ceil(Math.max(...allTemps) + 2);
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * (width - padding.left - padding.right);
  const getY = (val: number) => height - padding.bottom - ((val - minVal) / range) * (height - padding.top - padding.bottom);

  // Generate SVG paths
  const avgPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.avg_temp)}`).join(" ");
  const minPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.min_temp)}`).join(" ");
  const maxPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.max_temp)}`).join(" ");

  // Y-axis ticks
  const yTicks = [minVal, Math.round((minVal + range / 2) * 10) / 10, maxVal];

  return (
    <div className="relative overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">1. Monthly Average Temperature Trend</h4>
          <p className="text-xs text-slate-500">Historical temperature profile (°C) with seasonal extremes</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-sky-600 inline-block rounded-sm"></span> Avg Temp</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-sky-300 inline-block rounded-sm"></span> Min Temp</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-orange-500 inline-block rounded-sm"></span> Max Temp</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
        {/* Grid lines */}
        {yTicks.map(val => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {val}°C
            </text>
          </g>
        ))}

        {/* Lines */}
        <path d={minPath} fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="5 5" />
        <path d={maxPath} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" />
        <path d={avgPath} fill="none" stroke="#0284c7" strokeWidth="3.5" />

        {/* Data points & X ticks */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cyAvg = getY(d.avg_temp);
          return (
            <g key={i}>
              <line x1={cx} y1={height - padding.bottom} x2={cx} y2={height - padding.bottom + 6} stroke="#cbd5e1" />
              <text x={cx} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
                {d.period}
              </text>
              <circle
                cx={cx}
                cy={cyAvg}
                r={hoveredIndex === i ? 6 : 4.5}
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 text-xs text-center py-1.5 px-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg">
          <strong>{data[hoveredIndex].period}:</strong> Mean: {data[hoveredIndex].avg_temp}°C | Min: {data[hoveredIndex].min_temp}°C | Max: {data[hoveredIndex].max_temp}°C ({data[hoveredIndex].record_count} observations)
        </div>
      )}
    </div>
  );
};


// 2. Monthly Rainfall Bar Chart
export const MonthlyRainfallChart: React.FC<{ data: MonthlyAggregation[] }> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">No rainfall data available.</div>;
  }

  const height = 280;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };
  const width = Math.max(500, data.length * 60);

  const maxVal = Math.ceil(Math.max(...data.map(d => d.total_rainfall), 10) * 1.15);
  const getY = (val: number) => height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
  const barWidth = Math.max(16, (width - padding.left - padding.right) / data.length * 0.55);

  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="relative overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">2. Monthly Total Rainfall</h4>
          <p className="text-xs text-slate-500">Cumulative precipitation volume (mm) per month</p>
        </div>
        <div className="text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 font-medium">
          Unit: Millimeters (mm)
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
        {yTicks.map(val => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {val} mm
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const xCenter = padding.left + (i + 0.5) * ((width - padding.left - padding.right) / data.length);
          const x = xCenter - barWidth / 2;
          const y = getY(d.total_rainfall);
          const h = height - padding.bottom - y;

          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <defs>
                <linearGradient id={`rainGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, h)}
                rx="4"
                fill={`url(#rainGrad-${i})`}
                opacity={hoveredIndex === i ? 1 : 0.88}
                className="transition-all cursor-pointer"
              />
              {/* Value on top of bar */}
              <text
                x={xCenter}
                y={Math.max(padding.top - 5, y - 6)}
                textAnchor="middle"
                fontSize="10"
                fill="#0369a1"
                fontWeight="600"
              >
                {d.total_rainfall}
              </text>
              {/* X label */}
              <text x={xCenter} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
                {d.period}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 text-xs text-center py-1.5 px-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg">
          <strong>{data[hoveredIndex].period}:</strong> Total Rainfall: {data[hoveredIndex].total_rainfall} mm | Daily Avg: {data[hoveredIndex].avg_rainfall} mm | Peak Day: {data[hoveredIndex].max_rainfall} mm
        </div>
      )}
    </div>
  );
};


// 3. Monthly Average Humidity Line Chart
export const MonthlyHumidityChart: React.FC<{ data: MonthlyAggregation[] }> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">No humidity data available.</div>;
  }

  const height = 260;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };
  const width = Math.max(500, data.length * 60);

  const getY = (val: number) => height - padding.bottom - (val / 100) * (height - padding.top - padding.bottom);
  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * (width - padding.left - padding.right);

  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.avg_humidity)}`).join(" ");
  const areaPath = `M ${getX(0)} ${height - padding.bottom} L ${linePoints} L ${getX(data.length - 1)} ${height - padding.bottom} Z`;

  return (
    <div className="relative overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">3. Monthly Average Humidity Trend</h4>
          <p className="text-xs text-slate-500">Relative humidity (%) over annual seasonal cycles</p>
        </div>
        <div className="text-xs text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100 font-medium">
          Scale: 0% – 100%
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
        {[0, 25, 50, 75, 100].map(val => (
          <g key={val}>
            <line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
            />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {val}%
            </text>
          </g>
        ))}

        {/* Shaded Area */}
        <defs>
          <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#humGradient)" />

        {/* Line */}
        <polyline points={linePoints} fill="none" stroke="#0891b2" strokeWidth="3" />

        {/* Markers */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.avg_humidity);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={hoveredIndex === i ? 6 : 4.5}
                fill="#0891b2"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text x={cx} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
                {d.period}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-2 text-xs text-center py-1.5 px-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-lg">
          <strong>{data[hoveredIndex].period}:</strong> Mean Humidity: {data[hoveredIndex].avg_humidity}% | Min: {data[hoveredIndex].min_humidity}% | Max: {data[hoveredIndex].max_humidity}%
        </div>
      )}
    </div>
  );
};


// 4. Temperature Comparison Bar Chart across stations
export const TemperatureComparisonChart: React.FC<{ data: LocationAggregation[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">No station data available.</div>;
  }

  const height = 280;
  const padding = { top: 30, right: 30, bottom: 50, left: 50 };
  const width = Math.max(500, data.length * 80);

  const allTemps = data.flatMap(d => [d.min_temp, d.avg_temp, d.max_temp]);
  const minVal = Math.floor(Math.min(...allTemps) - 2);
  const maxVal = Math.ceil(Math.max(...allTemps) + 4);
  const range = maxVal - minVal || 1;

  const getY = (val: number) => height - padding.bottom - ((val - minVal) / range) * (height - padding.top - padding.bottom);
  const slotWidth = (width - padding.left - padding.right) / data.length;
  const barW = Math.max(8, slotWidth * 0.22);

  return (
    <div className="relative overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">4. Temperature Comparison Across Stations</h4>
          <p className="text-xs text-slate-500">Min, Average, and Max temperatures (°C) side-by-side</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-300 inline-block rounded-xs"></span> Min</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-600 inline-block rounded-xs"></span> Avg</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 inline-block rounded-xs"></span> Max</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
        {[minVal, Math.round((minVal + range / 2)), maxVal].map(val => (
          <g key={val}>
            <line x1={padding.left} y1={getY(val)} x2={width - padding.right} y2={getY(val)} stroke="#f1f5f9" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{val}°C</text>
          </g>
        ))}

        {data.map((d, i) => {
          const centerX = padding.left + (i + 0.5) * slotWidth;

          const yMin = getY(d.min_temp);
          const hMin = height - padding.bottom - yMin;

          const yAvg = getY(d.avg_temp);
          const hAvg = height - padding.bottom - yAvg;

          const yMax = getY(d.max_temp);
          const hMax = height - padding.bottom - yMax;

          return (
            <g key={i}>
              {/* Min Temp Bar */}
              <rect x={centerX - barW * 1.6} y={yMin} width={barW} height={Math.max(0, hMin)} rx="3" fill="#7dd3fc" />
              {/* Avg Temp Bar */}
              <rect x={centerX - barW * 0.5} y={yAvg} width={barW} height={Math.max(0, hAvg)} rx="3" fill="#0284c7" />
              {/* Max Temp Bar */}
              <rect x={centerX + barW * 0.6} y={yMax} width={barW} height={Math.max(0, hMax)} rx="3" fill="#f97316" />

              {/* Station Label */}
              <text x={centerX} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">
                {d.location}
              </text>
              <text x={centerX} y={height - padding.bottom + 34} textAnchor="middle" fontSize="9.5" fill="#94a3b8">
                {d.avg_temp}°C avg
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};


// 5. Daily Temperature Trends Line Chart
export const DailyTempChart: React.FC<{ data: DailyAggregation[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">No daily trend records available.</div>;
  }

  const height = 260;
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };
  const width = Math.max(600, data.length * 20);

  const allTemps = data.map(d => d.avg_temp);
  const minVal = Math.floor(Math.min(...allTemps) - 2);
  const maxVal = Math.ceil(Math.max(...allTemps) + 2);
  const range = maxVal - minVal || 1;

  const getY = (val: number) => height - padding.bottom - ((val - minVal) / range) * (height - padding.top - padding.bottom);
  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * (width - padding.left - padding.right);

  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.avg_temp)}`).join(" ");

  // Show only a subset of X labels to prevent crowding
  const step = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="relative overflow-x-auto bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">5. Daily Temperature Trends (Chronological Timeline)</h4>
          <p className="text-xs text-slate-500">Day-by-day observation mean temperature (°C) progression</p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
          {data.length} Observation Dates
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
        {[minVal, Math.round(minVal + range / 2), maxVal].map(val => (
          <g key={val}>
            <line x1={padding.left} y1={getY(val)} x2={width - padding.right} y2={getY(val)} stroke="#f1f5f9" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={getY(val) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{val}°C</text>
          </g>
        ))}

        <polyline points={linePoints} fill="none" stroke="#0284c7" strokeWidth="2.5" />

        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.avg_temp);

          const isLabel = i % step === 0 || i === data.length - 1;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3" fill="#0284c7" />
              {isLabel && (
                <text x={cx} y={height - padding.bottom + 20} textAnchor="middle" fontSize="10" fill="#64748b">
                  {d.observation_date}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
