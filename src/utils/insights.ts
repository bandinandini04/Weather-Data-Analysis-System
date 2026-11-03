/**
 * Weather Data Analysis System - Algorithmic Weather Insights Generator
 * Extracts factual meteorological patterns and empirical indicators
 * from the validated historical weather dataset without artificial extrapolation.
 */

import { ValidWeatherRecord, OverallStatistics, MonthlyAggregation, WeatherInsight } from "../types";

export function generateWeatherInsights(
  records: ValidWeatherRecord[],
  stats: OverallStatistics,
  monthly: MonthlyAggregation[]
): WeatherInsight[] {
  if (records.length === 0) return [];

  const insights: WeatherInsight[] = [];

  // 1. Thermal Extremes Insight
  const maxTempRecord = records.reduce((max, r) => (r.temperature > max.temperature ? r : max), records[0]);
  const minTempRecord = records.reduce((min, r) => (r.temperature < min.temperature ? r : min), records[0]);
  const tempSpread = maxTempRecord.temperature - minTempRecord.temperature;

  insights.push({
    category: "thermal",
    title: "Thermal Range & Extremes",
    description: `Peak high of ${maxTempRecord.temperature.toFixed(1)}°C observed at ${maxTempRecord.location} (${maxTempRecord.observation_date}). Lowest temperature of ${minTempRecord.temperature.toFixed(1)}°C recorded at ${minTempRecord.location} (${minTempRecord.observation_date}). Overall dataset thermal variance is ${tempSpread.toFixed(1)}°C.`,
    severity: maxTempRecord.temperature >= 38 ? "warning" : "info",
    value: `${stats.avg_temp.toFixed(1)}°C Mean`
  });

  // 2. Precipitation & Monsoon Peak
  const heavyRainDays = records.filter(r => r.rainfall >= 30);
  const maxRainRecord = records.reduce((max, r) => (r.rainfall > max.rainfall ? r : max), records[0]);
  const wettestMonth = monthly.length > 0
    ? monthly.reduce((max, m) => (m.total_rainfall > max.total_rainfall ? m : max), monthly[0])
    : null;

  insights.push({
    category: "rainfall",
    title: "Precipitation & Rainy Spells",
    description: `Total cumulative precipitation is ${stats.total_rainfall.toFixed(1)} mm across ${records.length} observation days. Single-day maximum rainfall was ${maxRainRecord.rainfall.toFixed(1)} mm at ${maxRainRecord.location} on ${maxRainRecord.observation_date}.${wettestMonth ? ` Heaviest monthly precipitation occurred in ${wettestMonth.month_name} (${wettestMonth.total_rainfall.toFixed(1)} mm).` : ""} ${heavyRainDays.length} heavy downpour day(s) (>=30 mm) identified.`,
    severity: heavyRainDays.length > 0 ? "highlight" : "info",
    value: `${stats.total_rainfall.toFixed(0)} mm Total`
  });

  // 3. Humidity & Comfort Index
  const comfortableDays = records.filter(r => r.humidity >= 45 && r.humidity <= 65).length;
  const humidDays = records.filter(r => r.humidity > 70).length;
  const dryDays = records.filter(r => r.humidity < 40).length;
  const comfortPct = Math.round((comfortableDays / records.length) * 100);

  insights.push({
    category: "humidity",
    title: "Atmospheric Humidity & Comfort Zone",
    description: `Mean relative humidity is ${stats.avg_humidity.toFixed(1)}% (Range: ${stats.min_humidity.toFixed(1)}% to ${stats.max_humidity.toFixed(1)}%). ${comfortPct}% of observations (${comfortableDays} days) fall within the standard human comfort band (45%–65% RH). High moisture conditions (>70% RH) were logged on ${humidDays} days, while dry conditions (<40% RH) appeared on ${dryDays} days.`,
    severity: comfortPct > 50 ? "success" : "info",
    value: `${comfortPct}% Comfort Band`
  });

  // 4. Station Stability Pattern
  const locationMap = new Map<string, { totalTemp: number; count: number; totalRain: number }>();
  records.forEach(r => {
    const existing = locationMap.get(r.location) || { totalTemp: 0, count: 0, totalRain: 0 };
    existing.totalTemp += r.temperature;
    existing.totalRain += r.rainfall;
    existing.count += 1;
    locationMap.set(r.location, existing);
  });

  const locationAvgs = Array.from(locationMap.entries()).map(([loc, data]) => ({
    location: loc,
    avgTemp: data.totalTemp / data.count,
    totalRain: data.totalRain
  }));

  if (locationAvgs.length > 1) {
    locationAvgs.sort((a, b) => b.avgTemp - a.avgTemp);
    const warmestStation = locationAvgs[0];
    const coolestStation = locationAvgs[locationAvgs.length - 1];

    insights.push({
      category: "pattern",
      title: "Inter-Station Variance",
      description: `Analysis across ${locationAvgs.length} weather stations shows ${warmestStation.location} as the warmest area (avg ${warmestStation.avgTemp.toFixed(1)}°C) and ${coolestStation.location} as the coolest (avg ${coolestStation.avgTemp.toFixed(1)}°C). Disparity between highest and lowest station averages is ${(warmestStation.avgTemp - coolestStation.avgTemp).toFixed(1)}°C.`,
      severity: "info",
      value: `${locationAvgs.length} Stations`
    });
  }

  return insights;
}
