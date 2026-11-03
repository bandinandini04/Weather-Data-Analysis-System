import React, { useState, useEffect } from "react";
import { UserProfile, UserSavedDataset, OverallStatistics, ValidationSummary } from "../types";
import { authService } from "../services/auth";
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  Award,
  Database,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  FileText,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  MapPin,
  Check
} from "lucide-react";

interface UserDashboardViewProps {
  currentUser?: UserProfile | null;
  stats: OverallStatistics;
  validationSummary: ValidationSummary;
  activeDatasetName: string;
  onLoadDatasetContent: (csvText: string, datasetName: string) => void;
  onNavigate: (page: any) => void;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAuth: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  currentUser: propUser,
  stats,
  validationSummary,
  activeDatasetName,
  onLoadDatasetContent,
  onNavigate,
  onUpdateUser,
  onOpenAuth
}) => {
  // Dynamically resolve active user from prop or live authentication system
  const activeUser = propUser || authService.getCurrentUser();

  // Dynamic user details with required fallbacks
  const displayName = (activeUser?.name && activeUser.name.trim().length > 0)
    ? activeUser.name.trim()
    : "User";

  const displayRole = (activeUser?.role && activeUser.role.trim().length > 0)
    ? activeUser.role.trim()
    : "Student / Researcher";

  const displayDepartment = (activeUser?.department && activeUser.department.trim().length > 0)
    ? activeUser.department.trim()
    : "Computer Science and Engineering (CSE)";

  const displayCollege = (activeUser?.college && activeUser.college.trim().length > 0)
    ? activeUser.college.trim()
    : "Mohan Babu University";

  const displayAcademicYear = activeUser?.academicYear || "2026–2027";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "U";
  const avatarGradient = activeUser?.avatarColor || "from-sky-500 to-indigo-600";

  const [userDatasets, setUserDatasets] = useState<UserSavedDataset[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [role, setRole] = useState(displayRole);
  const [department, setDepartment] = useState(displayDepartment);
  const [college, setCollege] = useState(displayCollege);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setName(activeUser?.name || "");
    setRole(activeUser?.role || displayRole);
    setDepartment(activeUser?.department || displayDepartment);
    setCollege(activeUser?.college || displayCollege);
    if (activeUser?.id) {
      const datasets = authService.getUserDatasets(activeUser.id);
      setUserDatasets(datasets);
    } else {
      setUserDatasets([]);
    }
  }, [propUser, activeUser?.id, activeUser?.name, activeUser?.role, activeUser?.department, activeUser?.college]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser?.id) return;

    // Update the specific logged-in user's information
    const updated = authService.updateProfile(activeUser.id, {
      name: name.trim() || "User",
      role: role.trim() || displayRole,
      department: department.trim() || displayDepartment,
      college: college.trim() || displayCollege
    });

    if (updated) {
      onUpdateUser(updated);
      setEditing(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleDeleteDataset = (id: string) => {
    authService.deleteUserDataset(id);
    setUserDatasets(prev => prev.filter(d => d.id !== id));
  };

  const handleLoadUserDataset = (dataset: UserSavedDataset) => {
    if (dataset.csvContent) {
      onLoadDatasetContent(dataset.csvContent, dataset.datasetName);
      onNavigate("dashboard");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Individual User Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr ${avatarGradient} p-1 border-2 border-white/50 shadow-lg flex items-center justify-center shrink-0`}>
              <span className="text-2xl md:text-3xl font-extrabold text-white">
                {avatarInitial}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{displayName}</h1>
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-semibold text-sky-100 border border-white/20">
                  {displayRole}
                </span>
              </div>
              <p className="text-sky-100 text-xs md:text-sm font-medium flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-sky-200" />
                {displayCollege} • {displayDepartment}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-sky-200 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Academic Year {displayAcademicYear}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Session Active
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition-colors cursor-pointer"
            >
              {editing ? "Cancel Editing" : "Edit Profile"}
            </button>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 bg-white text-sky-800 hover:bg-sky-50 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Switch Account
            </button>
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile credentials updated successfully!
        </div>
      )}

      {/* Edit Profile Form (if toggled) */}
      {editing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            Update Account Information
          </h3>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Role / Designation</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Student Researcher"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">College / University</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Mohan Babu University"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Personal Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Workspace</span>
            <Database className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate" title={activeDatasetName}>
            {stats.record_count > 0 ? `${stats.record_count} Records` : "No Data"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title={activeDatasetName}>
            {activeDatasetName}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quality Passed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {validationSummary.acceptance_rate_pct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {validationSummary.accepted_records} valid • {validationSummary.rejected_records} anomalies
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stations Audited</span>
            <MapPin className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {stats.unique_locations} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Geographic coverage
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Archived Datasets</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {userDatasets.length} Saved
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            In user dataset library
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          Quick Actions & Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => onNavigate("upload")}
            className="p-3.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900">Upload CSV / Excel</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ingest & audit weather datasets</div>
          </button>

          <button
            onClick={() => onNavigate("comparison")}
            className="p-3.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900">Compare Stations</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Location & date variance matrix</div>
          </button>

          <button
            onClick={() => onNavigate("visualization")}
            className="p-3.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900">Interactive Charts</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Temperature & rain trends</div>
          </button>

          <button
            onClick={() => onNavigate("reports")}
            className="p-3.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="font-bold text-slate-900">Export Reports</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Download PDF, CSV, and Excel</div>
          </button>
        </div>
      </div>

      {/* User Saved Datasets Library */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-sky-600" />
              My Dataset Library & Archives
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between saved meteorological datasets or restore previously analyzed files
            </p>
          </div>
          <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100">
            {userDatasets.length} Datasets
          </span>
        </div>

        {userDatasets.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-700">No saved datasets yet</div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Whenever you upload a CSV or Excel file, it automatically saves to your personal account library for easy re-analysis.
            </p>
            <button
              onClick={() => onNavigate("upload")}
              className="mt-3 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Upload First Dataset
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden border border-slate-200 rounded-xl">
            {userDatasets.map((ds) => (
              <div
                key={ds.id}
                className="p-4 bg-white hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                    {ds.datasetName}
                    {ds.datasetName === activeDatasetName && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active In Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>Uploaded: {new Date(ds.uploadedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{ds.recordCount} Total Rows</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{ds.validCount} Valid</span>
                    <span>•</span>
                    <span>Date Range: {ds.startDate} to {ds.endDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {ds.csvContent && (
                    <button
                      onClick={() => handleLoadUserDataset(ds)}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Load
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDataset(ds.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
