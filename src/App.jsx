import React, { useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import UploadCustomers from "./pages/UploadCustomers.jsx";
import DailySummary from "./pages/DailySummary.jsx";
import AIReminders from "./pages/AIReminders.jsx";
import Performance from "./pages/Performance.jsx";
import ServiceAnalytics from "./pages/ServiceAnalytics.jsx";
import CustomerProfile from "./pages/CustomerProfile.jsx";

export default function App() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-[#111] text-yellow-300" : "bg-white text-black"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-60 p-4 space-y-2 ${
          darkMode ? "bg-[#161616]" : "bg-gray-200"
        }`}
      >
        <h1 className="text-xl font-bold mb-4">Salon AI Dashboard</h1>

        <Link to="/" className="block p-2">Dashboard</Link>
        <Link to="/upload-customers" className="block p-2">Upload Customers</Link>
        <Link to="/daily-summary" className="block p-2">Daily Summary</Link>
        <Link to="/ai-reminders" className="block p-2">AI Reminders</Link>
        <Link to="/performance" className="block p-2">Performance</Link>
        <Link to="/service-analytics" className="block p-2">Service Analytics</Link>
        <Link to="/customer-profiles" className="block p-2">Customer Profiles</Link>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-6 w-full p-2 rounded font-bold bg-black text-yellow-400"
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload-customers" element={<UploadCustomers />} />
          <Route path="/daily-summary" element={<DailySummary />} />
          <Route path="/ai-reminders" element={<AIReminders />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/service-analytics" element={<ServiceAnalytics />} />
          <Route path="/customer-profiles" element={<CustomerProfile />} />
        </Routes>
      </main>
    </div>
  );
}
