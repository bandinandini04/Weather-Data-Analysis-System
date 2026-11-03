import JSZip from "jszip";
import { PYTHON_PROJECT_FILES } from "../pythonFilesContent";
import { RAW_SAMPLE_WEATHER_CSV } from "../sampleData";

export async function downloadPythonProjectZip(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder("weather-data-analysis-fullstack");

  if (!root) {
    throw new Error("Failed to initialize zip root folder");
  }

  // Add all code files
  PYTHON_PROJECT_FILES.forEach(file => {
    root.file(file.path, file.content);
  });

  // Ensure sample_weather.csv is bundled at both root and backend
  root.file("sample_weather.csv", RAW_SAMPLE_WEATHER_CSV);
  root.file("backend/sample_weather.csv", RAW_SAMPLE_WEATHER_CSV);

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "weather-data-analysis-fullstack.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
