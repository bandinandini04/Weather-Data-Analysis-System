export interface RawWeatherRow {
  observation_date: string;
  location: string;
  temperature: string | number;
  humidity: string | number;
  rainfall: string | number;
  [key: string]: any;
}

export interface ValidWeatherRecord {
  id: number;
  observation_date: string;
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  year: number;
  month: number;
  month_name: string;
  day: number;
  day_name: string;
}

export interface InvalidWeatherRecord {
  row_number: number;
  observation_date: string;
  location: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  rejection_reason: string;
}

export interface ValidationSummary {
  total_records: number;
  accepted_records: number;
  rejected_records: number;
  acceptance_rate_pct: number;
  missing_values_count: number;
  duplicates_count: number;
  invalid_dates_count: number;
  non_numeric_count: number;
  out_of_range_temp_count: number;
  out_of_range_humidity_count: number;
  negative_rainfall_count: number;
}

export interface OverallStatistics {
  record_count: number;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  avg_humidity: number;
  min_humidity: number;
  max_humidity: number;
  total_rainfall: number;
  avg_rainfall: number;
  max_rainfall: number;
  start_date: string;
  end_date: string;
  unique_locations: number;
}

export interface MonthlyAggregation {
  year: number;
  month: number;
  month_name: string;
  period: string;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  avg_humidity: number;
  min_humidity: number;
  max_humidity: number;
  total_rainfall: number;
  avg_rainfall: number;
  max_rainfall: number;
  record_count: number;
}

export interface DailyAggregation {
  observation_date: string;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  avg_humidity: number;
  total_rainfall: number;
  max_rainfall: number;
  location_count: number;
}

export interface LocationAggregation {
  location: string;
  record_count: number;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  avg_humidity: number;
  total_rainfall: number;
  avg_rainfall: number;
  max_rainfall: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  college: string;
  academicYear: string;
  createdAt: string;
  lastLogin: string;
  avatarColor: string;
}

export interface UserSavedDataset {
  id: string;
  userId: string;
  datasetName: string;
  uploadedAt: string;
  recordCount: number;
  validCount: number;
  invalidCount: number;
  startDate: string;
  endDate: string;
  locationsCount: number;
  csvContent?: string;
}

export interface WeatherInsight {
  category: "thermal" | "rainfall" | "humidity" | "pattern";
  title: string;
  description: string;
  severity: "info" | "success" | "warning" | "highlight";
  value?: string | number;
}

export interface StationComparisonData {
  location: string;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  avg_humidity: number;
  total_rainfall: number;
  record_count: number;
  temp_variance: number;
}

