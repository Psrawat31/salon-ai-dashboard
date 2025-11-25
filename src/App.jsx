import React, { useContext } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

import Dashboard from "./pages/Dashboard";
import UploadCustomers from "./pages/UploadCustomers";
import DailySummary from "./pages/DailySummary";
import AIReminders from "./pages/AIReminders";
import Performance from "./pages/Performance";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import CustomerProfile from "./pages/CustomerProfile";

const App = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <div className={darkMode ? "dark flex h-screen bg-[#111] text-yellow-300" : "flex h-screen bg-white text-black"}>

      {/* SIDEBAR */}
      <aside className={darkMode ? "w-60 p-4 space-y-2 bg-[#161616] text-yellow-300" : "w-60 p-4 space-y-2 bg-gray-200 text-black"}>
        <h1 className="text-xl font-bold mb-4">Salon AI Dashboard</h1>

        <Link to="/" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Dashboard</Link>
        <Link to="/upload-customers" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Upload Customers</Link>
        <Link to="/daily-summary" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Daily Summary</Link>
        <Link to="/ai-reminders" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">AI Reminders</Link>
        <Link to="/performance" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Performance</Link>
        <Link to="/service-analytics" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Service Analytics</Link>
        <Link to="/customer-profiles" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222]">Customer Profiles</Link>

        {/* DARK MODE BUTTON */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={darkMode ? "mt-6 w-full p-2 bg-yellow-400 text-black font-bold rounded" : "mt-6 w-full p-2 bg-black text-yellow-400 font-bold rounded"}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={darkMode ? "flex-1 p-6 overflow-auto bg-[#111] text-yellow-300" : "flex-1 p-6 overflow-auto bg-white text-black"}>
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
};

export default App;
