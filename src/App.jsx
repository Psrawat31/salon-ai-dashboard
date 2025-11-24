import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import UploadCustomers from "./pages/UploadCustomers";
import DailySummary from "./pages/DailySummary";
import Performance from "./pages/Performance";
import ServiceAnalytics from "./pages/ServiceAnalytics";
import AIReminders from "./pages/AIReminders";
import "./App.css";

function App() {
  // 🔥 Global customer state, initialised from localStorage
  const [customers, setCustomers] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("customers");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to read customers from localStorage", err);
      return [];
    }
  });

  // 🔄 Keep localStorage in sync with state
  useEffect(() => {
    try {
      window.localStorage.setItem("customers", JSON.stringify(customers));
    } catch (err) {
      console.error("Failed to save customers to localStorage", err);
    }
  }, [customers]);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Upload page updates global + localStorage */}
            <Route
              path="/upload-customers"
              element={<UploadCustomers setCustomers={setCustomers} />}
            />

            {/* Daily Summary reads from global state (which is backed by localStorage) */}
            <Route
              path="/daily-summary"
              element={<DailySummary customers={customers} />}
            />

            <Route path="/ai-reminders" element={<AIReminders />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/service-analytics" element={<ServiceAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
