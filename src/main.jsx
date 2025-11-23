import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./App.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import CustomerUpload from "./pages/CustomerUpload.jsx";
import DailySummary from "./pages/DailySummary.jsx";
import DailyReminders from "./pages/DailyReminders.jsx";
import Performance from "./pages/Performance.jsx";
import ServiceAnalytics from "./pages/ServiceAnalytics.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Upload Customers */}
          <Route path="/upload-customers" element={<CustomerUpload />} />

          {/* Daily Summary */}
          <Route path="/daily-summary" element={<DailySummary />} />

          {/* AI Reminders */}
          <Route path="/ai-reminders" element={<DailyReminders />} />

          {/* Performance */}
          <Route path="/performance" element={<Performance />} />

          {/* Service Analytics */}
          <Route path="/service-analytics" element={<ServiceAnalytics />} />

          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </App>
    </Router>
  </React.StrictMode>
);
