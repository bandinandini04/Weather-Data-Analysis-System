import {
  ValidWeatherRecord,
  OverallStatistics,
  MonthlyAggregation,
  DailyAggregation,
  LocationAggregation
} from "../types";

export function computeOverallStatistics(records: ValidWeatherRecord[]): OverallStatistics {
  if (records.length === 0) {
    return {
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
    };
  }

  let sumTemp = 0;
  let minTemp = records[0].temperature;
  let maxTemp = records[0].temperature;

  let sumHum = 0;
  let minHum = records[0].humidity;
  let maxHum = records[0].humidity;

  let sumRain = 0;
  let maxRain = records[0].rainfall;

  const dates: string[] = [];
  const locations = new Set<string>();

  records.forEach(r => {
    sumTemp += r.temperature;
    if (r.temperature < minTemp) minTemp = r.temperature;
    if (r.temperature > maxTemp) maxTemp = r.temperature;

    sumHum += r.humidity;
    if (r.humidity < minHum) minHum = r.humidity;
    if (r.humidity > maxHum) maxHum = r.humidity;

    sumRain += r.rainfall;
    if (r.rainfall > maxRain) maxRain = r.rainfall;

    dates.push(r.observation_date);
    locations.add(r.location);
  });

  dates.sort();
  const count = records.length;

  return {
    record_count: count,
    avg_temp: Math.round((sumTemp / count) * 100) / 100,
    min_temp: Math.round(minTemp * 100) / 100,
    max_temp: Math.round(maxTemp * 100) / 100,
    avg_humidity: Math.round((sumHum / count) * 100) / 100,
    min_humidity: Math.round(minHum * 100) / 100,
    max_humidity: Math.round(maxHum * 100) / 100,
    total_rainfall: Math.round(sumRain * 100) / 100,
    avg_rainfall: Math.round((sumRain / count) * 100) / 100,
    max_rainfall: Math.round(maxRain * 100) / 100,
    start_date: dates[0] || "N/A",
    end_date: dates[dates.length - 1] || "N/A",
    unique_locations: locations.size
  };
}

export function computeMonthlyAnalysis(records: ValidWeatherRecord[]): MonthlyAggregation[] {
  if (records.length === 0) return [];

  // Group by "YYYY-MM"
  const groups: Record<string, ValidWeatherRecord[]> = {};
  records.forEach(r => {
    const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const keys = Object.keys(groups).sort();
  return keys.map(key => {
    const group = groups[key];
    const first = group[0];
    const count = group.length;

    let sumTemp = 0;
    let minTemp = group[0].temperature;
    let maxTemp = group[0].temperature;

    let sumHum = 0;
    let minHum = group[0].humidity;
    let maxHum = group[0].humidity;

    let sumRain = 0;
    let maxRain = group[0].rainfall;

    group.forEach(r => {
      sumTemp += r.temperature;
      if (r.temperature < minTemp) minTemp = r.temperature;
      if (r.temperature > maxTemp) maxTemp = r.temperature;

      sumHum += r.humidity;
      if (r.humidity < minHum) minHum = r.humidity;
      if (r.humidity > maxHum) maxHum = r.humidity;

      sumRain += r.rainfall;
      if (r.rainfall > maxRain) maxRain = r.rainfall;
    });

    return {
      year: first.year,
      month: first.month,
      month_name: first.month_name,
      period: `${first.month_name.slice(0, 3)} ${first.year}`,
      avg_temp: Math.round((sumTemp / count) * 10) / 10,
      min_temp: Math.round(minTemp * 10) / 10,
      max_temp: Math.round(maxTemp * 10) / 10,
      avg_humidity: Math.round((sumHum / count) * 10) / 10,
      min_humidity: Math.round(minHum * 10) / 10,
      max_humidity: Math.round(maxHum * 10) / 10,
      total_rainfall: Math.round(sumRain * 10) / 10,
      avg_rainfall: Math.round((sumRain / count) * 10) / 10,
      max_rainfall: Math.round(maxRain * 10) / 10,
      record_count: count
    };
  });
}

export function computeDailyAnalysis(records: ValidWeatherRecord[]): DailyAggregation[] {
  if (records.length === 0) return [];

  const groups: Record<string, ValidWeatherRecord[]> = {};
  records.forEach(r => {
    if (!groups[r.observation_date]) groups[r.observation_date] = [];
    groups[r.observation_date].push(r);
  });

  const dates = Object.keys(groups).sort();
  return dates.map(d => {
    const group = groups[d];
    const count = group.length;

    let sumTemp = 0;
    let minTemp = group[0].temperature;
    let maxTemp = group[0].temperature;
    let sumHum = 0;
    let sumRain = 0;
    let maxRain = group[0].rainfall;
    const locSet = new Set<string>();

    group.forEach(r => {
      sumTemp += r.temperature;
      if (r.temperature < minTemp) minTemp = r.temperature;
      if (r.temperature > maxTemp) maxTemp = r.temperature;
      sumHum += r.humidity;
      sumRain += r.rainfall;
      if (r.rainfall > maxRain) maxRain = r.rainfall;
      locSet.add(r.location);
    });

    return {
      observation_date: d,
      avg_temp: Math.round((sumTemp / count) * 10) / 10,
      min_temp: Math.round(minTemp * 10) / 10,
      max_temp: Math.round(maxTemp * 10) / 10,
      avg_humidity: Math.round((sumHum / count) * 10) / 10,
      total_rainfall: Math.round(sumRain * 10) / 10,
      max_rainfall: Math.round(maxRain * 10) / 10,
      location_count: locSet.size
    };
  });
}

export function computeLocationAnalysis(records: ValidWeatherRecord[]): LocationAggregation[] {
  if (records.length === 0) return [];

  const groups: Record<string, ValidWeatherRecord[]> = {};
  records.forEach(r => {
    if (!groups[r.location]) groups[r.location] = [];
    groups[r.location].push(r);
  });

  const locs = Object.keys(groups).sort();
  return locs.map(loc => {
    const group = groups[loc];
    const count = group.length;

    let sumTemp = 0;
    let minTemp = group[0].temperature;
    let maxTemp = group[0].temperature;
    let sumHum = 0;
    let sumRain = 0;
    let maxRain = group[0].rainfall;

    group.forEach(r => {
      sumTemp += r.temperature;
      if (r.temperature < minTemp) minTemp = r.temperature;
      if (r.temperature > maxTemp) maxTemp = r.temperature;
      sumHum += r.humidity;
      sumRain += r.rainfall;
      if (r.rainfall > maxRain) maxRain = r.rainfall;
    });

    return {
      location: loc,
      record_count: count,
      avg_temp: Math.round((sumTemp / count) * 10) / 10,
      min_temp: Math.round(minTemp * 10) / 10,
      max_temp: Math.round(maxTemp * 10) / 10,
      avg_humidity: Math.round((sumHum / count) * 10) / 10,
      total_rainfall: Math.round(sumRain * 10) / 10,
      avg_rainfall: Math.round((sumRain / count) * 10) / 10,
      max_rainfall: Math.round(maxRain * 10) / 10
    };
  });
}
