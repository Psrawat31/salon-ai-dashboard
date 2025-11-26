// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./Layout";

import Dashboard from "./pages/Dashboard";
import UploadCustomers from "./pages/CustomerUpload";
import DailySummary from "./pages/DailySummary";
import AIReminders from "./pages/AIReminders";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import CustomerProfiles from "./pages/CustomerProfile";

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark mode to document
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
      <Routes>
        <Route path="/" element={<Dashboard darkMode={darkMode} />} />
        <Route path="/upload" element={<UploadCustomers darkMode={darkMode} />} />
        <Route path="/summary" element={<DailySummary darkMode={darkMode} />} />
        <Route path="/reminders" element={<AIReminders darkMode={darkMode} />} />
        <Route path="/analytics" element={<ServiceAnalytics darkMode={darkMode} />} />
        <Route path="/profiles" element={<CustomerProfiles darkMode={darkMode} />} />
      </Routes>
    </Layout>
  );
}
