import React, { useState } from "react";
import { PYTHON_PROJECT_FILES, PythonFileMeta } from "../pythonFilesContent";
import { downloadPythonProjectZip } from "../utils/zipExport";
import { downloadBlob } from "../utils/reports";
import {
  FolderArchive,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  FileCode,
  Laptop,
  Globe,
  Github,
  Server,
  Database,
  Layers,
  ArrowRight
} from "lucide-react";

export const PythonCodeView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileMeta>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [guideTab, setGuideTab] = useState<"code" | "vscode" | "deploy">("code");

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    downloadBlob(selectedFile.content, selectedFile.name, "text/plain");
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadPythonProjectZip();
    } catch (e: any) {
      alert("Error packaging zip: " + e.message);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with 1-click ZIP export */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5" />
            Full-Stack Project Suite: React + Flask + MySQL
          </div>
          <h2 className="text-xl md:text-2xl font-bold">
            Python Flask Backend & Deployment Hub
          </h2>
          <p className="text-sky-100 text-xs md:text-sm mt-1 max-w-xl">
            Complete, professional code directory ready for local VS Code execution, GitHub submission, and online deployment on Render & Vercel.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-6 py-3 bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <FolderArchive className="w-4 h-4 text-sky-600" />
          {isZipping ? "Packaging ZIP..." : "Download Complete Full-Stack Project (.zip)"}
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setGuideTab("code")}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            guideTab === "code"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Source Code Inspector ({PYTHON_PROJECT_FILES.length} Files)
        </button>

        <button
          onClick={() => setGuideTab("vscode")}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            guideTab === "vscode"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Laptop className="w-4 h-4 text-sky-600" />
          Local VS Code Setup Guide
        </button>

        <button
          onClick={() => setGuideTab("deploy")}
          className={`py-3 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            guideTab === "deploy"
              ? "border-sky-600 text-sky-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          GitHub, Render & Vercel Deployment
        </button>
      </div>

      {/* TAB 1: CODE INSPECTOR */}
      {guideTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Navigator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Project Files</span>
              <FileCode className="w-3.5 h-3.5" />
            </div>

            <div className="space-y-1 max-h-[520px] overflow-y-auto">
              {PYTHON_PROJECT_FILES.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => { setSelectedFile(file); setCopied(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-50 text-sky-800 font-bold border border-sky-200"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-mono">{file.name}</div>
                      <div className="text-[10px] text-slate-400 font-sans truncate">{file.path}</div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase ${
                      file.category === "module" ? "bg-purple-100 text-purple-700" :
                      file.category === "core" ? "bg-sky-100 text-sky-700" :
                      file.category === "deploy" ? "bg-emerald-100 text-emerald-700" :
                      file.category === "config" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-md flex flex-col overflow-hidden">
            {/* File Header Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">{selectedFile.path}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy File"}
                </button>

                <button
                  onClick={handleDownloadSingle}
                  className="px-3 py-1 bg-sky-700 hover:bg-sky-600 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Syntax Content Box */}
            <div className="p-5 overflow-x-auto max-h-[520px] font-mono text-xs leading-relaxed text-slate-300 selection:bg-sky-800 selection:text-white">
              <pre className="m-0 whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCAL VS CODE EXECUTION GUIDE */}
      {guideTab === "vscode" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-sky-600" />
              Step-by-Step Local Execution in Visual Studio Code
            </h3>
            <p className="text-xs text-slate-500">
              Run both the Python Flask Backend and React Frontend concurrently on your computer.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
                Extract & Open in VS Code
              </div>
              <p>Download the project ZIP using the button above and extract the folder. Open VS Code, select <strong>File &gt; Open Folder...</strong>, and choose <code>weather-data-analysis-fullstack</code>.</p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
                Start the Python Flask Backend (Terminal 1)
              </div>
              <p>Open a new terminal in VS Code (<code>Ctrl + `</code> or <code>Cmd + `</code>) and execute:</p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                <div><span className="text-slate-500"># Create and activate virtual environment</span></div>
                <div>python3 -m venv venv</div>
                <div><span className="text-slate-500"># macOS/Linux:</span> source venv/bin/activate</div>
                <div><span className="text-slate-500"># Windows:</span> venv\Scripts\activate</div>
                <div className="pt-1"><span className="text-slate-500"># Install dependencies</span></div>
                <div className="text-emerald-400">pip install -r backend/requirements.txt</div>
                <div className="pt-1"><span className="text-slate-500"># Start Flask API server</span></div>
                <div className="text-sky-300">python backend/app.py</div>
              </div>
              <p className="text-[11px] text-slate-500">The Flask backend will launch at <code>http://localhost:5000</code> with CORS enabled.</p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">3</span>
                Start the React Frontend (Terminal 2)
              </div>
              <p>Open a second terminal tab in VS Code and start the Vite dev server:</p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                <div><span className="text-slate-500"># Install Node dependencies</span></div>
                <div>npm install</div>
                <div className="pt-1"><span className="text-slate-500"># Start development server</span></div>
                <div className="text-emerald-400">npm run dev</div>
              </div>
              <p className="text-[11px] text-slate-500">The React dashboard will be live at <code>http://localhost:3000</code> and automatically proxies <code>/api</code> calls to Flask.</p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">4</span>
                Verify MySQL Database Integration (Optional)
              </div>
              <p>If you have MySQL installed, create a database <code>weather_analytics_db</code>. Copy <code>.env.example</code> to <code>.env</code> and configure your <code>DB_USER</code> and <code>DB_PASSWORD</code>. If MySQL is not running, the application seamlessly operates in <strong>CSV Demonstration Mode</strong>.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOYMENT GUIDE */}
      {guideTab === "deploy" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              Online Deployment Guide: Render, Vercel & Managed MySQL
            </h3>
            <p className="text-xs text-slate-500">
              Deploy your project publicly for online access, college demonstration, and portfolio submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
            {/* Deploy Backend on Render */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-600" />
                1. Deploy Python Flask Backend (Render.com)
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li>Create an account at <a href="https://render.com" target="_blank" rel="noreferrer" className="text-sky-600 underline">render.com</a>.</li>
                <li>Click <strong>New &gt; Web Service</strong> and connect your GitHub repository.</li>
                <li>Set <strong>Environment</strong> to <code>Python 3</code>.</li>
                <li>Set <strong>Build Command</strong>: <code>pip install -r requirements.txt</code></li>
                <li>Set <strong>Start Command</strong>: <code>gunicorn backend.app:app</code></li>
                <li>Under <strong>Environment Variables</strong>, set:
                  <div className="bg-white p-2 rounded-md font-mono text-[10px] mt-1 border border-slate-200">
                    CORS_ORIGINS=*<br />
                    FLASK_DEBUG=false
                  </div>
                </li>
                <li>Click <strong>Create Web Service</strong>. Copy your backend URL (e.g. <code>https://weather-api.onrender.com</code>).</li>
              </ol>
            </div>

            {/* Deploy Frontend on Vercel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                2. Deploy React Frontend (Vercel)
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li>Create an account at <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-600 underline">vercel.com</a>.</li>
                <li>Click <strong>Add New &gt; Project</strong> and import your GitHub repository.</li>
                <li>Framework Preset: <code>Vite</code>.</li>
                <li>Build Command: <code>npm run build</code>, Output Directory: <code>dist</code>.</li>
                <li>Under <strong>Environment Variables</strong>, add:
                  <div className="bg-white p-2 rounded-md font-mono text-[10px] mt-1 border border-slate-200">
                    VITE_API_BASE_URL=https://your-backend.onrender.com/api
                  </div>
                </li>
                <li>Click <strong>Deploy</strong>. Your application will be live globally on a free Vercel domain!</li>
              </ol>
            </div>

            {/* GitHub Repository Setup */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 md:col-span-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Github className="w-4 h-4 text-slate-800" />
                3. Push to GitHub
              </div>
              <p className="text-slate-600">Initialize a Git repository and push your project to GitHub:</p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m "Upgrade Weather Data Analysis System to Full-Stack React + Flask + MySQL"</div>
                <div>git branch -M main</div>
                <div>git remote add origin https://github.com/your-username/weather-data-analysis.git</div>
                <div>git push -u origin main</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
