/**
 * Weather Data Analysis System - Frontend API Client
 * Connects React UI to the Python Flask backend with environment-based configuration.
 * Provides fallback handling if the Flask backend is not yet running locally.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  database: {
    driver_installed: boolean;
    connected: boolean;
    host: string;
    port?: number;
    database: string;
    mode: string;
    message: string;
  };
  active_dataset: string;
  records_count: number;
  anomalies_count: number;
}

export interface DashboardApiResponse {
  has_data: boolean;
  dataset_name?: string;
  message?: string;
  metrics: {
    total_records: number;
    avg_temp: number;
    min_temp: number;
    max_temp: number;
    avg_humidity: number;
    min_humidity: number;
    max_humidity: number;
    total_rainfall: number;
    avg_rainfall: number;
    max_rainfall: number;
    valid_records: number;
    invalid_records: number;
    acceptance_rate_pct: number;
    unique_locations?: number;
    start_date?: string;
    end_date?: string;
  };
  monthly_trends: any[];
  recent_records: any[];
}

export interface AnalysisApiResponse {
  has_data: boolean;
  message?: string;
  total_records?: number;
  filtered_count?: number;
  statistics: any;
  monthly_analysis: any[];
  daily_analysis: any[];
  location_analysis: any[];
}

export interface RecordsApiResponse {
  records: any[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  tab: string;
}

export const weatherApi = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  /**
   * Health Check: GET /api/health
   */
  async checkHealth(): Promise<{ isConnected: boolean; data?: BackendHealthResponse; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        return { isConnected: true, data };
      }
      return { isConnected: false, error: `Backend responded with HTTP ${response.status}` };
    } catch (err: any) {
      return { isConnected: false, error: err.message || "Failed to reach backend server" };
    }
  },

  /**
   * Dashboard: GET /api/dashboard
   */
  async getDashboard(): Promise<DashboardApiResponse> {
    const res = await fetch(`${API_BASE_URL}/dashboard`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Dashboard request failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Upload: POST /api/upload
   * Supports file upload via FormData or direct CSV text via JSON
   */
  async uploadCSV(fileOrText: File | string, filename: string = "weather.csv"): Promise<any> {
    if (typeof fileOrText === "string") {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv_text: fileOrText, filename })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    } else {
      const formData = new FormData();
      formData.append("file", fileOrText);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    }
  },

  /**
   * Analysis: GET /api/analysis
   */
  async getAnalysis(filters?: {
    locations?: string[];
    start_date?: string;
    end_date?: string;
    months?: number[];
    years?: number[];
  }): Promise<AnalysisApiResponse> {
    const params = new URLSearchParams();
    if (filters?.locations && filters.locations.length > 0) {
      params.append("locations", filters.locations.join(","));
    }
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.months && filters.months.length > 0) {
      params.append("months", filters.months.join(","));
    }
    if (filters?.years && filters.years.length > 0) {
      params.append("years", filters.years.join(","));
    }

    const url = `${API_BASE_URL}/analysis?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Analysis failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Records: GET /api/records
   */
  async getRecords(params?: {
    tab?: "valid" | "invalid";
    search?: string;
    date?: string;
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  }): Promise<RecordsApiResponse> {
    const q = new URLSearchParams();
    if (params?.tab) q.append("tab", params.tab);
    if (params?.search) q.append("search", params.search);
    if (params?.date) q.append("date", params.date);
    if (params?.sort) q.append("sort", params.sort);
    if (params?.order) q.append("order", params.order);
    if (params?.page) q.append("page", String(params.page));
    if (params?.pageSize) q.append("page_size", String(params.pageSize));

    const res = await fetch(`${API_BASE_URL}/records?${q.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to fetch records" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Download Cleaned CSV: GET /api/reports/cleaned-csv
   */
  async downloadCleanedCSV(): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/reports/cleaned-csv`);
    if (!res.ok) throw new Error("Failed to download cleaned CSV report");
    return res.blob();
  },

  /**
   * Download Monthly CSV: GET /api/reports/monthly-csv
   */
  async downloadMonthlyCSV(): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/reports/monthly-csv`);
    if (!res.ok) throw new Error("Failed to download monthly CSV report");
    return res.blob();
  },

  /**
   * Download Quality CSV: GET /api/reports/quality-csv
   */
  async downloadQualityCSV(): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/reports/quality-csv`);
    if (!res.ok) throw new Error("Failed to download quality CSV report");
    return res.blob();
  },

  /**
   * Download PDF: GET /api/reports/pdf
   */
  async downloadPdfReport(): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/reports/pdf`);
    if (!res.ok) throw new Error("Failed to download PDF report");
    return res.blob();
  },

  /**
   * Reset Sample: POST /api/reset-sample
   */
  async resetSample(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reset-sample`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset sample data");
    return res.json();
  }
};
