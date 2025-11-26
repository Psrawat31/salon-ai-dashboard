// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UploadCustomers from "./pages/CustomerUpload";
import DailySummary from "./pages/DailySummary";
import AIReminders from "./pages/AIReminders";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import CustomerProfiles from "./pages/CustomerProfile";

export default function App() {
  const location = useLocation();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    return prefersDark;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#020617";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f9fafb";
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const themeColors = {
    bg: darkMode ? "#020617" : "#f9fafb",
    panel: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#f9fafc" : "#0f172a",
    subText: darkMode ? "#cbd5e1" : "#6b7280",
    activeBg: darkMode ? "#1e293b" : "#e5e7eb",
  };

  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/upload", label: "Upload Customers" },
    { to: "/summary", label: "Daily Summary" },
    { to: "/reminders", label: "AI Reminders" },
    { to: "/analytics", label: "Service Analytics" },
    { to: "/profiles", label: "Customer Profiles" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeColors.bg,
        color: themeColors.text,
        display: "flex",
      }}
    >
      {/* LEFT VERTICAL NAV */}
      <aside
        style={{
          width: "220px",
          padding: "20px 16px",
          borderRight: `1px solid ${
            darkMode ? "#1f2937" : "#e5e7eb"
          }`,
          background: themeColors.panel,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          Salon AI Dashboard
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  color: themeColors.text,
                  background: isActive
                    ? themeColors.activeBg
                    : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          style={{
            marginTop: "20px",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid #64748b",
            background: darkMode ? "#020617" : "#ffffff",
            color: themeColors.text,
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard darkMode={darkMode} />} />
          <Route path="/upload" element={<UploadCustomers />} />
          <Route path="/summary" element={<DailySummary />} />
          <Route path="/reminders" element={<AIReminders />} />
          <Route path="/analytics" element={<ServiceAnalytics />} />
          <Route path="/profiles" element={<CustomerProfiles />} />
        </Routes>
      </main>
    </div>
  );
}
