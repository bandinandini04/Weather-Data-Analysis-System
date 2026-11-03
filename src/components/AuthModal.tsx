import React, { useState } from "react";
import { authService } from "../services/auth";
import { UserProfile } from "../types";
import {
  X,
  User,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "demo">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Computer Science and Engineering (CSE)");
  const [college, setCollege] = useState("Mohan Babu University");
  const [role, setRole] = useState("Student Researcher");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authService.login(email, password);
    setLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.message || "Failed to log in.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await authService.register({
      name,
      email,
      password,
      department,
      college,
      role
    });
    setLoading(false);
    if (res.success && res.user) {
      setSuccess("Account successfully registered!");
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 600);
    } else {
      setError(res.message || "Registration failed.");
    }
  };

  const handleQuickDemo = (userId: string) => {
    const user = authService.quickLogin(userId);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-sky-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">User Authentication</h3>
              <p className="text-xs text-sky-200">Weather Data Analysis System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab("login"); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "login"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab("register"); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "register"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab("demo"); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "demo"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          {/* Quick Demo Logins */}
          {activeTab === "demo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-3">
                Select a pre-configured role to immediately test individual dashboard features and dataset archives without entering credentials:
              </p>

              <button
                type="button"
                onClick={() => handleQuickDemo("user-student")}
                className="w-full p-3.5 bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200 rounded-xl text-left hover:border-sky-400 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Student Researcher</div>
                  <div className="text-[11px] text-slate-500">Mohan Babu University • CSE • 2026–2027</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded-md group-hover:bg-sky-700">
                  Switch
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("user-evaluator")}
                className="w-full p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-xl text-left hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Faculty Evaluator / Examiner</div>
                  <div className="text-[11px] text-slate-500">Academic Reviewer Mode • Full Audit Access</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md group-hover:bg-emerald-700">
                  Switch
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("user-researcher")}
                className="w-full p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200 rounded-xl text-left hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">Guest Meteorological Analyst</div>
                  <div className="text-[11px] text-slate-500">Environmental Data Research Institute</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-md group-hover:bg-amber-700">
                  Switch
                </span>
              </button>
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@mbu.edu.in"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Demo password: <code className="bg-slate-100 px-1 rounded text-slate-600">mbu@2026</code></span>
                  <button
                    type="button"
                    onClick={() => { setEmail("nandini@mbu.edu.in"); setPassword("mbu@2026"); }}
                    className="text-sky-600 hover:underline font-medium"
                  >
                    Auto-fill Nandini
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Authenticating..." : "Sign In to Dashboard"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nandini"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@mbu.edu.in"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">College</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="Student Researcher">Student Researcher</option>
                  <option value="Faculty / Evaluator">Faculty / Evaluator</option>
                  <option value="Project Member">Project Member</option>
                  <option value="Meteorological Analyst">Meteorological Analyst</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Registering..." : "Create Account & Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
