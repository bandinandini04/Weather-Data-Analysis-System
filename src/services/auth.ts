/**
 * Weather Data Analysis System - Authentication & User Management Service
 * Provides secure credential hashing (SHA-256 via Web Crypto API),
 * user registration, session management, and individual user dataset libraries.
 */

import { UserProfile, UserSavedDataset } from "../types";

// Hash password with SHA-256 for secure local/offline storage
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "weather_salt_2026_mbu");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

interface StoredAccount extends UserProfile {
  passwordHash: string;
}

const STORAGE_USERS_KEY = "weather_users_v2";
const STORAGE_CURRENT_USER_KEY = "weather_current_user_v2";
const STORAGE_DATASETS_KEY = "weather_user_datasets_v2";

// Default demo accounts for academic evaluation
const DEFAULT_ACCOUNTS: StoredAccount[] = [
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
    avatarColor: "from-sky-500 to-indigo-600",
    passwordHash: "7b4d96a75908ef1a4cbbdcf282387a8b417f54c156f082e05b38be8e5628b3ee" // "mbu@2026"
  },
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
    avatarColor: "from-emerald-500 to-teal-600",
    passwordHash: "7b4d96a75908ef1a4cbbdcf282387a8b417f54c156f082e05b38be8e5628b3ee" // "mbu@2026"
  },
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
    avatarColor: "from-amber-500 to-orange-600",
    passwordHash: "7b4d96a75908ef1a4cbbdcf282387a8b417f54c156f082e05b38be8e5628b3ee" // "mbu@2026"
  }
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts: StoredAccount[] = JSON.parse(raw);
    // Sanitize any legacy hardcoded Nandini / Project Developer (Lead) entry
    const sanitized = accounts.map(a => {
      if (a.name === "Nandini" && a.role === "Project Developer (Lead)") {
        return { ...a, name: "Student Researcher", role: "Project Member" };
      }
      return a;
    });
    return sanitized;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to save accounts to storage:", err);
  }
}

export const authService = {
  // Get currently logged-in user
  getCurrentUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Cleanse legacy hardcoded credentials if present
        if (parsed.name === "Nandini" && parsed.role === "Project Developer (Lead)") {
          parsed.name = "Student Researcher";
          parsed.role = "Project Member";
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      const accounts = getStoredAccounts();
      const firstAccount = accounts[0] || DEFAULT_ACCOUNTS[0];
      const defaultUser: UserProfile = {
        id: firstAccount.id,
        name: firstAccount.name,
        email: firstAccount.email,
        role: firstAccount.role,
        department: firstAccount.department,
        college: firstAccount.college,
        academicYear: firstAccount.academicYear,
        createdAt: firstAccount.createdAt,
        lastLogin: new Date().toISOString(),
        avatarColor: firstAccount.avatarColor
      };
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return null;
    }
  },

  // Login with credentials
  async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const accounts = getStoredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());

    if (!account) {
      return { success: false, message: "No account found with this email address." };
    }

    const inputHash = await hashPassword(password);
    // Also allow universal demo password "mbu@2026" or "password123"
    const valid = account.passwordHash === inputHash || password === "mbu@2026" || password === "password123";

    if (!valid) {
      return { success: false, message: "Incorrect password. Please try again." };
    }

    // Update last login
    account.lastLogin = new Date().toISOString();
    saveAccounts(accounts);

    const profile: UserProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      department: account.department,
      college: account.college,
      academicYear: account.academicYear,
      createdAt: account.createdAt,
      lastLogin: account.lastLogin,
      avatarColor: account.avatarColor
    };

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  },

  // Quick Demo Login
  quickLogin(userId: string): UserProfile {
    const accounts = getStoredAccounts();
    const account = accounts.find(a => a.id === userId || (userId === "user-nandini" && (a.id === "user-student" || a.id === "user-nandini"))) || accounts[0];
    account.lastLogin = new Date().toISOString();
    saveAccounts(accounts);

    const profile: UserProfile = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      department: account.department,
      college: account.college,
      academicYear: account.academicYear,
      createdAt: account.createdAt,
      lastLogin: account.lastLogin,
      avatarColor: account.avatarColor
    };
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profile));
    return profile;
  },

  // Register new account
  async register(params: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    college?: string;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    if (!params.name.trim() || !params.email.trim() || !params.password) {
      return { success: false, message: "Please fill in all required fields." };
    }

    if (params.password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters long." };
    }

    const accounts = getStoredAccounts();
    if (accounts.some(a => a.email.toLowerCase() === params.email.trim().toLowerCase())) {
      return { success: false, message: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(params.password);
    const colors = [
      "from-sky-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-violet-500 to-purple-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600"
    ];
    const avatarColor = colors[accounts.length % colors.length];

    const newAccount: StoredAccount = {
      id: `user-${Date.now()}`,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role || "Meteorological Analyst",
      department: params.department || "Computer Science and Engineering (CSE)",
      college: params.college || "Mohan Babu University",
      academicYear: "2026–2027",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: new Date().toISOString(),
      avatarColor,
      passwordHash
    };

    accounts.push(newAccount);
    saveAccounts(accounts);

    const profile: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      department: newAccount.department,
      college: newAccount.college,
      academicYear: newAccount.academicYear,
      createdAt: newAccount.createdAt,
      lastLogin: newAccount.lastLogin,
      avatarColor: newAccount.avatarColor
    };

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  },

  // Logout
  logout(): void {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  },

  // Update profile
  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex(a => a.id === userId);
    if (idx === -1) return null;

    accounts[idx] = { ...accounts[idx], ...updates };
    saveAccounts(accounts);

    const updatedProfile: UserProfile = {
      id: accounts[idx].id,
      name: accounts[idx].name,
      email: accounts[idx].email,
      role: accounts[idx].role,
      department: accounts[idx].department,
      college: accounts[idx].college,
      academicYear: accounts[idx].academicYear,
      createdAt: accounts[idx].createdAt,
      lastLogin: accounts[idx].lastLogin,
      avatarColor: accounts[idx].avatarColor
    };
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  },

  // Save dataset to user library
  saveUserDataset(dataset: Omit<UserSavedDataset, "id" | "uploadedAt">): UserSavedDataset {
    let list: UserSavedDataset[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_DATASETS_KEY);
      if (raw) list = JSON.parse(raw);
    } catch {
      list = [];
    }

    const newRecord: UserSavedDataset = {
      ...dataset,
      id: `ds-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    // Filter out duplicates with same name for this user
    list = [newRecord, ...list.filter(d => !(d.userId === dataset.userId && d.datasetName === dataset.datasetName))].slice(0, 20);
    localStorage.setItem(STORAGE_DATASETS_KEY, JSON.stringify(list));
    return newRecord;
  },

  // Get user datasets
  getUserDatasets(userId: string): UserSavedDataset[] {
    try {
      const raw = localStorage.getItem(STORAGE_DATASETS_KEY);
      if (raw) {
        const list: UserSavedDataset[] = JSON.parse(raw);
        return list.filter(d => d.userId === userId || d.userId === "all");
      }
    } catch {
      // return default demo
    }
    return [];
  },

  // Delete user dataset
  deleteUserDataset(id: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_DATASETS_KEY);
      if (raw) {
        const list: UserSavedDataset[] = JSON.parse(raw);
        const filtered = list.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_DATASETS_KEY, JSON.stringify(filtered));
      }
    } catch (err) {
      console.error("Failed to delete dataset:", err);
    }
  }
};
