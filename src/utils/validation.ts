import { ValidWeatherRecord, InvalidWeatherRecord, ValidationSummary } from "../types";

export const REQUIRED_COLUMNS = [
  "observation_date",
  "location",
  "temperature",
  "humidity",
  "rainfall"
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma handling basic values
    const values = rawLine.split(",").map(v => v.trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rowObj[header] = values[colIdx] !== undefined ? values[colIdx] : "";
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function validateWeatherData(csvText: string): {
  validRecords: ValidWeatherRecord[];
  invalidRecords: InvalidWeatherRecord[];
  summary: ValidationSummary;
  headers: string[];
} {
  const { headers, rows } = parseCSV(csvText);

  // Check required headers
  const missingHeaders = REQUIRED_COLUMNS.filter(req => !headers.includes(req));
  if (missingHeaders.length > 0) {
    throw new Error(
      `Uploaded CSV is missing mandatory columns: ${missingHeaders.join(", ")}. Please include: ${REQUIRED_COLUMNS.join(", ")}`
    );
  }

  const validRecords: ValidWeatherRecord[] = [];
  const invalidRecords: InvalidWeatherRecord[] = [];

  let missingCount = 0;
  let dupCount = 0;
  let invalidDateCount = 0;
  let nonNumericCount = 0;
  let tempRangeCount = 0;
  let humidityRangeCount = 0;
  let negativeRainCount = 0;

  // Track seen date-location pairs for duplicate detection
  const seenPairs = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed line number accounting for header
    const reasons: string[] = [];

    const rawDate = row["observation_date"] ?? "";
    const rawLoc = row["location"] ?? "";
    const rawTemp = row["temperature"] ?? "";
    const rawHum = row["humidity"] ?? "";
    const rawRain = row["rainfall"] ?? "";

    // 1. Missing values check
    const missingCols: string[] = [];
    if (!rawDate.trim()) missingCols.push("observation_date");
    if (!rawLoc.trim()) missingCols.push("location");
    if (!rawTemp.trim()) missingCols.push("temperature");
    if (!rawHum.trim()) missingCols.push("humidity");
    if (!rawRain.trim()) missingCols.push("rainfall");

    if (missingCols.length > 0) {
      missingCount++;
      reasons.push(`Missing value in column(s): ${missingCols.join(", ")}`);
    }

    // 2. Duplicate Check
    const cleanDate = rawDate.trim();
    const cleanLoc = rawLoc.trim().toLowerCase();
    const pairKey = `${cleanDate}|${cleanLoc}`;

    if (cleanDate && cleanLoc) {
      if (seenPairs.has(pairKey)) {
        dupCount++;
        reasons.push(`Duplicate observation for location "${rawLoc.trim()}" on date ${cleanDate}`);
      } else {
        seenPairs.add(pairKey);
      }
    }

    // 3. Date Validation
    let parsedDate: Date | null = null;
    let formattedDate = "";
    if (cleanDate) {
      // Regex check YYYY-MM-DD
      const dateParts = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (dateParts) {
        const y = parseInt(dateParts[1], 10);
        const m = parseInt(dateParts[2], 10);
        const d = parseInt(dateParts[3], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
          const dt = new Date(Date.UTC(y, m - 1, d));
          if (!isNaN(dt.getTime()) && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d) {
            parsedDate = dt;
            formattedDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          }
        }
      }

      if (!parsedDate) {
        invalidDateCount++;
        reasons.push(`Invalid date format or out-of-range date: "${rawDate}" (expected YYYY-MM-DD between 1900-2100)`);
      }
    }

    // 4. Numeric & Range Validations
    // Temperature
    let numTemp = NaN;
    if (rawTemp.trim()) {
      numTemp = parseFloat(rawTemp);
      if (isNaN(numTemp)) {
        nonNumericCount++;
        reasons.push(`Non-numeric temperature reading: "${rawTemp}"`);
      } else if (numTemp < -50.0 || numTemp > 60.0) {
        tempRangeCount++;
        reasons.push(`Temperature ${numTemp}°C is outside valid meteorological threshold (-50°C to 60°C)`);
      }
    }

    // Humidity
    let numHum = NaN;
    if (rawHum.trim()) {
      numHum = parseFloat(rawHum);
      if (isNaN(numHum)) {
        nonNumericCount++;
        reasons.push(`Non-numeric humidity reading: "${rawHum}"`);
      } else if (numHum < 0.0 || numHum > 100.0) {
        humidityRangeCount++;
        reasons.push(`Humidity ${numHum}% is outside realistic atmospheric range (0% to 100%)`);
      }
    }

    // Rainfall
    let numRain = NaN;
    if (rawRain.trim()) {
      numRain = parseFloat(rawRain);
      if (isNaN(numRain)) {
        nonNumericCount++;
        reasons.push(`Non-numeric rainfall reading: "${rawRain}"`);
      } else if (numRain < 0.0) {
        negativeRainCount++;
        reasons.push(`Negative rainfall is physically impossible: ${numRain} mm`);
      } else if (numRain > 1500.0) {
        reasons.push(`Rainfall ${numRain} mm exceeds single-day cloudburst threshold (1500 mm)`);
      }
    }

    // Record Classification
    if (reasons.length === 0 && parsedDate) {
      const year = parsedDate.getUTCFullYear();
      const month = parsedDate.getUTCMonth() + 1;
      const day = parsedDate.getUTCDate();
      const monthName = MONTH_NAMES[month - 1];
      const dayName = DAY_NAMES[parsedDate.getUTCDay()];

      validRecords.push({
        id: validRecords.length + 1,
        observation_date: formattedDate,
        location: rawLoc.trim().replace(/\b\w/g, l => l.toUpperCase()),
        temperature: Math.round(numTemp * 100) / 100,
        humidity: Math.round(numHum * 100) / 100,
        rainfall: Math.round(numRain * 100) / 100,
        year,
        month,
        month_name: monthName,
        day,
        day_name: dayName
      });
    } else {
      invalidRecords.push({
        row_number: rowNum,
        observation_date: rawDate,
        location: rawLoc,
        temperature: rawTemp,
        humidity: rawHum,
        rainfall: rawRain,
        rejection_reason: reasons.join("; ")
      });
    }
  });

  const total = rows.length;
  const accepted = validRecords.length;
  const rejected = invalidRecords.length;

  return {
    validRecords,
    invalidRecords,
    summary: {
      total_records: total,
      accepted_records: accepted,
      rejected_records: rejected,
      acceptance_rate_pct: total > 0 ? Math.round((accepted / total) * 10000) / 100 : 0,
      missing_values_count: missingCount,
      duplicates_count: dupCount,
      invalid_dates_count: invalidDateCount,
      non_numeric_count: nonNumericCount,
      out_of_range_temp_count: tempRangeCount,
      out_of_range_humidity_count: humidityRangeCount,
      negative_rainfall_count: negativeRainCount
    },
    headers
  };
}
