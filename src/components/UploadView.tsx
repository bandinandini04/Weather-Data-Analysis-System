import React, { useState } from "react";
import { ValidationSummary, InvalidWeatherRecord } from "../types";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  Info,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { CSV_TEMPLATE_SAMPLE } from "../sampleData";
import { downloadBlob } from "../utils/reports";
import { parseExcelFile, downloadSampleExcelTemplate } from "../utils/excel";

interface UploadViewProps {
  onProcessCSV: (csvText: string, filename: string) => void;
  onLoadSample: () => void;
  validationSummary: ValidationSummary;
  invalidRecords: InvalidWeatherRecord[];
  activeDatasetName: string;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onProcessCSV,
  onLoadSample,
  validationSummary,
  invalidRecords,
  activeDatasetName
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileSizeKB, setFileSizeKB] = useState<number>(0);
  const [fileType, setFileType] = useState<"csv" | "excel">("csv");
  const [sheetName, setSheetName] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const handleFile = async (file: File) => {
    const nameLower = file.name.toLowerCase();
    const isCsv = nameLower.endsWith(".csv");
    const isExcel = nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls");

    if (!isCsv && !isExcel) {
      setErrorMessage("Unsupported file type. Please upload a standard .csv or Excel .xlsx / .xls file.");
      return;
    }

    setErrorMessage("");
    setSelectedFileName(file.name);
    setFileSizeKB(Math.round((file.size / 1024) * 10) / 10);
    setFileType(isExcel ? "excel" : "csv");

    if (isExcel) {
      setIsParsing(true);
      try {
        const parsed = await parseExcelFile(file);
        setFileContent(parsed.csvText);
        setSheetName(parsed.sheetName);

        // Preview from CSV representation
        const lines = parsed.csvText.trim().split(/\r?\n/).slice(0, 6);
        if (lines.length > 0) {
          const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
          setPreviewHeaders(headers);
          const dataRows = lines.slice(1).map(l => l.split(",").map(v => v.trim().replace(/^"|"$/g, "")));
          setPreviewRows(dataRows);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to parse Excel workbook.");
      } finally {
        setIsParsing(false);
      }
    } else {
      // Standard CSV
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
        setSheetName("");

        const lines = text.trim().split(/\r?\n/).slice(0, 6);
        if (lines.length > 0) {
          const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
          setPreviewHeaders(headers);
          const dataRows = lines.slice(1).map(l => l.split(",").map(v => v.trim().replace(/^"|"$/g, "")));
          setPreviewRows(dataRows);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const executeValidation = () => {
    if (!fileContent) {
      setErrorMessage("Please select a valid CSV or Excel file first.");
      return;
    }
    try {
      onProcessCSV(fileContent, selectedFileName);
      setSuccessMessage(`Successfully validated and loaded "${selectedFileName}" into the active analytics session!`);
      setErrorMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to validate dataset.");
      setSuccessMessage("");
    }
  };

  const downloadCsvTemplate = () => {
    downloadBlob(CSV_TEMPLATE_SAMPLE, "weather_sample_template.csv", "text/csv");
  };

  const downloadExcelTemplate = () => {
    downloadSampleExcelTemplate();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">📁 Upload Historical Weather Data</h2>
        <p className="text-sm text-slate-500">
          Upload observations in CSV or Excel (.xlsx, .xls) format. The validation engine audits missing values, duplicate entries, date formatting, and realistic meteorological bounds.
        </p>
      </div>

      {/* Grid: Upload Box + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
              isDragging ? "border-sky-500 bg-sky-50/50" : "border-slate-300 hover:border-sky-400"
            }`}
          >
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Select or Drag & Drop Weather Dataset
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Supports CSV (.csv) and Microsoft Excel (.xlsx, .xls) files
            </p>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl cursor-pointer transition-colors shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              Browse CSV or Excel File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </label>
          </div>

          {/* Uploaded File Status Card */}
          {selectedFileName && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${
                  fileType === "excel" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"
                }`}>
                  {fileType === "excel" ? "XLSX" : "CSV"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{selectedFileName}</div>
                  <div className="text-xs text-slate-500">
                    {fileSizeKB} KB {sheetName ? `• Worksheet: "${sheetName}"` : ""} • Ready for validation
                  </div>
                </div>
              </div>
              <button
                onClick={executeValidation}
                disabled={isParsing}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {isParsing ? "Reading File..." : "Run Validation Engine"}
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Validation Success:</strong> {successMessage}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Validation Failure:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Raw Dataset Preview */}
          {previewRows.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Raw Dataset Preview (First 5 Rows)
                </span>
                <span className="text-[11px] text-slate-400">Total Columns: {previewHeaders.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold text-[11px]">
                      {previewHeaders.map((h, i) => (
                        <th key={i} className="py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {previewRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-2 px-3">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Requirements & Sample Download Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              File Requirements
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">•</span>
                <span>Supported: <strong>.csv</strong> or <strong>.xlsx / .xls</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-600 font-bold">•</span>
                <span>Required column headers:</span>
              </li>
            </ul>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div>1. observation_date</div>
              <div>2. location</div>
              <div>3. temperature</div>
              <div>4. humidity</div>
              <div>5. rainfall</div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={downloadCsvTemplate}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample CSV (.csv)
              </button>
              <button
                onClick={downloadExcelTemplate}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Download Sample Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-600" />
              Demonstration Dataset
            </h4>
            <p className="text-xs text-sky-800">
              Load an authentic historical dataset containing 90+ meteorological records across 6 major weather stations with test edge-cases for data audit.
            </p>
            <button
              onClick={onLoadSample}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Built-in Sample Dataset
            </button>
          </div>
        </div>
      </div>

      {/* Preprocessing and Validation Audit Display */}
      {validationSummary.total_records > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                Data Validation & Preprocessing Audit
              </h3>
              <p className="text-xs text-slate-500">
                Audited dataset: <strong>{activeDatasetName}</strong> • Records separated by validation integrity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
                {validationSummary.accepted_records} Accepted ({validationSummary.acceptance_rate_pct}%)
              </span>
              <span className="text-xs px-2.5 py-1 bg-rose-100 text-rose-800 font-semibold rounded-full">
                {validationSummary.rejected_records} Rejected
              </span>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Records</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.total_records}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Accepted Records</div>
              <div className="text-xl font-bold text-emerald-700">{validationSummary.accepted_records}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-[10px] uppercase font-bold text-rose-700">Rejected Records</div>
              <div className="text-xl font-bold text-rose-700">{validationSummary.rejected_records}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Missing Values</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.missing_values_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Duplicate Records</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.duplicates_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Invalid Dates</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.invalid_dates_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Non-Numeric Values</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.non_numeric_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Temp Out-of-Bounds</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.out_of_range_temp_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Humidity Out-of-Bounds</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.out_of_range_humidity_count}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500">Negative Rainfall</div>
              <div className="text-xl font-bold text-slate-800">{validationSummary.negative_rainfall_count}</div>
            </div>
          </div>

          {/* Invalid Records Log Table */}
          {invalidRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Corrupted & Rejected Records Log ({invalidRecords.length} items quarantined)
                </span>
                <span className="text-[11px] text-slate-400">Zero Silent Deletion Policy</span>
              </div>

              <div className="overflow-x-auto border border-rose-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-rose-50/60 border-b border-rose-200 text-rose-900 font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Row #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Temp</th>
                      <th className="py-2.5 px-3">Humidity</th>
                      <th className="py-2.5 px-3">Rainfall</th>
                      <th className="py-2.5 px-3">Algorithmic Rejection Cause</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 text-slate-700">
                    {invalidRecords.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/30">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{inv.row_number}</td>
                        <td className="py-2.5 px-3 font-mono">{inv.observation_date || "NULL"}</td>
                        <td className="py-2.5 px-3">{inv.location || "NULL"}</td>
                        <td className="py-2.5 px-3 font-mono">{inv.temperature || "NULL"}</td>
                        <td className="py-2.5 px-3 font-mono">{inv.humidity || "NULL"}</td>
                        <td className="py-2.5 px-3 font-mono">{inv.rainfall || "NULL"}</td>
                        <td className="py-2.5 px-3 text-rose-700 font-medium">
                          {inv.rejection_reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
