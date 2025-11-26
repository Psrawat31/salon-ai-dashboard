// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UploadCustomers from "./pages/CustomerUpload";
import DailySummary from "./pages/DailySummary";
import AIReminders from "./pages/AIReminders";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import CustomerProfiles from "./pages/CustomerProfile";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    return prefersDark;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((p) => !p);

  return (
    <div
      style={{
        padding: "16px",
        background: darkMode ? "#0f172a" : "#ffffff",
        minHeight: "100vh",
        color: darkMode ? "#f8fafc" : "#0f172a",
        transition: "0.3s ease",
      }}
    >
      {/* Navigation */}
      <nav style={{ marginBottom: "20px" }}>
        <Link style={{ marginRight: "12px" }} to="/">Dashboard</Link>
        <Link style={{ marginRight: "12px" }} to="/upload">Upload Customers</Link>
        <Link style={{ marginRight: "12px" }} to="/summary">Daily Summary</Link>
        <Link style={{ marginRight: "12px" }} to="/reminders">AI Reminders</Link>
        <Link style={{ marginRight: "12px" }} to="/analytics">Service Analytics</Link>
        <Link style={{ marginRight: "12px" }} to="/profiles">Customer Profiles</Link>

        <button
          onClick={toggleTheme}
          style={{
            marginLeft: "12px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            background: darkMode ? "#1e293b" : "#f1f5f9",
            color: darkMode ? "#f8fafc" : "#0f172a",
          }}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadCustomers />} />
        <Route path="/summary" element={<DailySummary />} />
        <Route path="/reminders" element={<AIReminders />} />
        <Route path="/analytics" element={<ServiceAnalytics />} />
        <Route path="/profiles" element={<CustomerProfiles />} />
      </Routes>
    </div>
  );
}
