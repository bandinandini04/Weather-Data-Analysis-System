import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { RAW_SAMPLE_WEATHER_CSV } from "./src/sampleData.ts";
import { validateWeatherData } from "./src/utils/validation.ts";
import {
  computeOverallStatistics,
  computeMonthlyAnalysis,
  computeDailyAnalysis,
  computeLocationAnalysis
} from "./src/utils/analysis.ts";
import { ValidWeatherRecord, InvalidWeatherRecord, ValidationSummary } from "./src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const isProd = process.env.NODE_ENV === "production";

// In-Memory Session State
let datasetName = "sample_weather.csv (Automatic Demo Load)";
let validRecords: ValidWeatherRecord[] = [];
let invalidRecords: InvalidWeatherRecord[] = [];
let validationSummary: ValidationSummary = {
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
};

// Seed initial sample data
function loadInitialSample() {
  try {
    const result = validateWeatherData(RAW_SAMPLE_WEATHER_CSV);
    validRecords = result.validRecords;
    invalidRecords = result.invalidRecords;
    validationSummary = result.summary;
    datasetName = "sample_weather.csv";
  } catch (e) {
    console.error("Failed to seed initial weather data:", e);
  }
}
loadInitialSample();

async function startServer() {
  const app = express();

  // Middleware for body parsing
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // ==========================================
  // API ROUTE 1: GET /api/health
  // ==========================================
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Weather Data Analysis System API",
      version: "2.0.0",
      runtime: "Express + Vite full-stack engine (Python Flask mirror)",
      database: {
        driver_installed: true,
        connected: false,
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "weather_analytics_db",
        mode: "CSV Demonstration Mode (Standalone)",
        message: "Standalone active. MySQL connector ready."
      },
      active_dataset: datasetName,
      records_count: validRecords.length,
      anomalies_count: invalidRecords.length
    });
  });

  // ==========================================
  // API ROUTE 2: GET /api/dashboard
  // ==========================================
  app.get("/api/dashboard", (_req, res) => {
    if (validRecords.length === 0) {
      return res.json({
        has_data: false,
        message: "No weather dataset has been loaded yet.",
        metrics: {
          total_records: 0,
          avg_temp: 0,
          avg_humidity: 0,
          total_rainfall: 0,
          valid_records: 0,
          invalid_records: 0,
          acceptance_rate_pct: 0
        },
        monthly_trends: [],
        recent_records: []
      });
    }

    const stats = computeOverallStatistics(validRecords);
    const monthlyTrends = computeMonthlyAnalysis(validRecords);
    const recent = [...validRecords]
      .sort((a, b) => b.observation_date.localeCompare(a.observation_date))
      .slice(0, 10);

    res.json({
      has_data: true,
      dataset_name: datasetName,
      metrics: {
        total_records: validationSummary.total_records,
        avg_temp: stats.avg_temp,
        min_temp: stats.min_temp,
        max_temp: stats.max_temp,
        avg_humidity: stats.avg_humidity,
        min_humidity: stats.min_humidity,
        max_humidity: stats.max_humidity,
        total_rainfall: stats.total_rainfall,
        avg_rainfall: stats.avg_rainfall,
        max_rainfall: stats.max_rainfall,
        valid_records: validationSummary.accepted_records,
        invalid_records: validationSummary.rejected_records,
        acceptance_rate_pct: validationSummary.acceptance_rate_pct,
        unique_locations: stats.unique_locations,
        start_date: stats.start_date,
        end_date: stats.end_date
      },
      monthly_trends: monthlyTrends,
      recent_records: recent
    });
  });

  // ==========================================
  // API ROUTE 3: POST /api/upload
  // ==========================================
  app.post("/api/upload", (req, res) => {
    try {
      const csvText = req.body.csv_text || req.body.content || "";
      const filename = req.body.filename || "uploaded_weather.csv";

      if (!csvText || typeof csvText !== "string" || !csvText.trim()) {
        return res.status(400).json({ error: "Empty CSV content provided." });
      }

      const result = validateWeatherData(csvText);
      validRecords = result.validRecords;
      invalidRecords = result.invalidRecords;
      validationSummary = result.summary;
      datasetName = filename;

      res.json({
        success: true,
        message: `Successfully ingested and validated '${filename}'.`,
        filename,
        validation_summary: result.summary,
        preview: validRecords.slice(0, 5)
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to process CSV." });
    }
  });

  // ==========================================
  // API ROUTE 4: GET /api/analysis
  // ==========================================
  app.get("/api/analysis", (req, res) => {
    if (validRecords.length === 0) {
      return res.json({ has_data: false, message: "No weather data loaded." });
    }

    const locationsArg = req.query.locations as string;
    const locations = locationsArg ? locationsArg.split(",").map(l => l.trim().toLowerCase()) : null;
    const startDate = (req.query.start_date as string) || null;
    const endDate = (req.query.end_date as string) || null;
    const monthsArg = req.query.months as string;
    const months = monthsArg ? monthsArg.split(",").map(m => parseInt(m.trim(), 10)).filter(n => !isNaN(n)) : null;
    const yearsArg = req.query.years as string;
    const years = yearsArg ? yearsArg.split(",").map(y => parseInt(y.trim(), 10)).filter(n => !isNaN(n)) : null;

    let filtered = validRecords.filter(r => {
      if (locations && !locations.includes(r.location.toLowerCase())) return false;
      if (startDate && r.observation_date < startDate) return false;
      if (endDate && r.observation_date > endDate) return false;
      if (months && !months.includes(r.month)) return false;
      if (years && !years.includes(r.year)) return false;
      return true;
    });

    const stats = computeOverallStatistics(filtered);
    const monthlyAnalysis = computeMonthlyAnalysis(filtered);
    const dailyAnalysis = computeDailyAnalysis(filtered);
    const locationAnalysis = computeLocationAnalysis(filtered);

    res.json({
      has_data: true,
      total_records: validRecords.length,
      filtered_count: filtered.length,
      statistics: stats,
      monthly_analysis: monthlyAnalysis,
      daily_analysis: dailyAnalysis,
      location_analysis: locationAnalysis
    });
  });

  // ==========================================
  // API ROUTE 5: GET /api/records
  // ==========================================
  app.get("/api/records", (req, res) => {
    const tab = (req.query.tab as string) || "valid";
    const search = ((req.query.search as string) || "").trim().toLowerCase();
    const dateFilter = ((req.query.date as string) || "").trim();
    const sortCol = (req.query.sort as string) || "observation_date";
    const order = ((req.query.order as string) || "asc").toLowerCase();
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt((req.query.page_size as string) || "20", 10)));

    let target: any[] = tab === "invalid" ? [...invalidRecords] : [...validRecords];

    if (search) {
      target = target.filter(r => (r.location || "").toLowerCase().includes(search));
    }
    if (dateFilter) {
      target = target.filter(r => r.observation_date === dateFilter);
    }

    target.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (typeof valA === "string" && typeof valB === "string") {
        return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return order === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });

    const totalCount = target.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIdx = (page - 1) * pageSize;
    const sliced = target.slice(startIdx, startIdx + pageSize);

    res.json({
      records: sliced,
      total_count: totalCount,
      page,
      page_size: pageSize,
      total_pages: totalPages,
      tab
    });
  });

  // ==========================================
  // API ROUTE 6: GET /api/reports/cleaned-csv
  // ==========================================
  app.get("/api/reports/cleaned-csv", (_req, res) => {
    const header = "observation_date,location,temperature,humidity,rainfall\n";
    const rows = validRecords
      .map(r => `${r.observation_date},"${r.location}",${r.temperature},${r.humidity},${r.rainfall}`)
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=cleaned_weather_data.csv");
    res.send(header + rows);
  });

  // ==========================================
  // API ROUTE 7: GET /api/reports/monthly-csv
  // ==========================================
  app.get("/api/reports/monthly-csv", (_req, res) => {
    const monthly = computeMonthlyAnalysis(validRecords);
    const header = "year,month,month_name,period,avg_temp,min_temp,max_temp,avg_humidity,total_rainfall,avg_rainfall,max_rainfall,record_count\n";
    const rows = monthly
      .map(m => `${m.year},${m.month},"${m.month_name}","${m.period}",${m.avg_temp},${m.min_temp},${m.max_temp},${m.avg_humidity},${m.total_rainfall},${m.avg_rainfall},${m.max_rainfall},${m.record_count}`)
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=monthly_weather_analysis.csv");
    res.send(header + rows);
  });

  // ==========================================
  // API ROUTE 8: GET /api/reports/quality-csv
  // ==========================================
  app.get("/api/reports/quality-csv", (_req, res) => {
    const header = "row_number,observation_date,location,temperature,humidity,rainfall,rejection_reason\n";
    const rows = invalidRecords
      .map(r => `${r.row_number},"${r.observation_date}","${r.location}","${r.temperature}","${r.humidity}","${r.rainfall}","${r.rejection_reason.replace(/"/g, '""')}"`)
      .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=data_quality_audit_log.csv");
    res.send(header + rows);
  });

  // ==========================================
  // API ROUTE 9: POST /api/reset-sample
  // ==========================================
  app.post("/api/reset-sample", (_req, res) => {
    loadInitialSample();
    res.json({
      success: true,
      message: "Reset to authentic sample weather dataset.",
      validation_summary: validationSummary
    });
  });

  // ==========================================
  // User Management & Profile Persistence
  // ==========================================
  interface ServerUserProfile {
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

  const userDatabase = new Map<string, ServerUserProfile>([
    [
      "user-student",
      {
        id: "user-student",
        name: "Student Researcher",
        email: "student@mbu.edu.in",
        role: "Project Member",
        department: "Computer Science and Engineering (CSE)",
        college: "Mohan Babu University",
        academicYear: "2026–2027",
        createdAt: "2026-08-15",
        lastLogin: new Date().toISOString(),
        avatarColor: "from-sky-500 to-indigo-600"
      }
    ],
    [
      "user-evaluator",
      {
        id: "user-evaluator",
        name: "Faculty Evaluator",
        email: "evaluator@mbu.edu.in",
        role: "Academic Examiner / Reviewer",
        department: "Computer Science and Engineering (CSE)",
        college: "Mohan Babu University",
        academicYear: "2026–2027",
        createdAt: "2026-09-01",
        lastLogin: new Date().toISOString(),
        avatarColor: "from-emerald-500 to-teal-600"
      }
    ],
    [
      "user-researcher",
      {
        id: "user-researcher",
        name: "Guest Researcher",
        email: "researcher@weather.org",
        role: "Meteorological Data Analyst",
        department: "Atmospheric & Climate Studies",
        college: "National Environmental Institute",
        academicYear: "2026–2027",
        createdAt: "2026-10-10",
        lastLogin: new Date().toISOString(),
        avatarColor: "from-amber-500 to-orange-600"
      }
    ]
  ]);

  // API ROUTE 10: GET /api/users/:id
  app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = userDatabase.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: `Account with ID '${userId}' not found.` });
    }
    return res.json({ success: true, user });
  });

  // API ROUTE 11: PUT /api/users/:id and PUT /api/user/profile
  app.put(["/api/users/:id", "/api/user/profile"], (req, res) => {
    try {
      const userId = (req.params.id || req.body.userId || req.body.id || "").trim();
      if (!userId) {
        return res.status(400).json({ success: false, error: "Valid User ID is required." });
      }

      const { name, role, department, college, academicYear } = req.body;

      // Validation
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, error: "Display Name is required." });
      }
      if (name.trim().length < 2) {
        return res.status(400).json({ success: false, error: "Display Name must be at least 2 characters long." });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ success: false, error: "Display Name cannot exceed 100 characters." });
      }

      const existing = userDatabase.get(userId) || {
        id: userId,
        name: name.trim(),
        email: req.body.email || `${userId}@mbu.edu.in`,
        role: "Project Member",
        department: "Computer Science and Engineering (CSE)",
        college: "Mohan Babu University",
        academicYear: "2026–2027",
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: new Date().toISOString(),
        avatarColor: "from-sky-500 to-indigo-600"
      };

      const updated: ServerUserProfile = {
        ...existing,
        name: name.trim(),
        role: (role && typeof role === "string" && role.trim()) ? role.trim() : existing.role,
        department: (department && typeof department === "string" && department.trim()) ? department.trim() : existing.department,
        college: (college && typeof college === "string" && college.trim()) ? college.trim() : existing.college,
        academicYear: (academicYear && typeof academicYear === "string" && academicYear.trim()) ? academicYear.trim() : existing.academicYear,
        lastLogin: new Date().toISOString()
      };

      userDatabase.set(userId, updated);

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: updated
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Failed to update profile." });
    }
  });

  // ==========================================
  // Vite Integration (Dev Middleware or Static Prod)
  // ==========================================
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Weather Data Analysis System listening on port ${PORT}`);
    console.log(`📡 Full-Stack API endpoints active at http://localhost:${PORT}/api/`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
