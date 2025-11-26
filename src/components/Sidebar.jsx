// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ darkMode }) {
  const route = useLocation().pathname;

  const bg = darkMode ? "#141a2b" : "#ffffff";
  const border = darkMode ? "#1f2937" : "#e5e7eb";
  const text = darkMode ? "#e2e8f0" : "#111";

  const itemStyle = (path) => ({
    padding: "12px 18px",
    borderRadius: "8px",
    marginBottom: "8px",
    fontWeight: route === path ? 600 : 400,
    background: route === path ? (darkMode ? "#1e293b" : "#e5e7eb") : "transparent",
    color: text,
    textDecoration: "none",
    display: "block",
  });

  return (
    <div
      style={{
        width: "220px",
        borderRight: `1px solid ${border}`,
        padding: "25px 20px",
        background: bg,
        height: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "25px", color: text }}>AI Dashboard</h2>

      <Link to="/" style={itemStyle("/")}>Dashboard</Link>
      <Link to="/upload" style={itemStyle("/upload")}>Upload Customers</Link>
      <Link to="/summary" style={itemStyle("/summary")}>Daily Summary</Link>
      <Link to="/reminders" style={itemStyle("/reminders")}>AI Reminders</Link>
      <Link to="/analytics" style={itemStyle("/analytics")}>Service Analytics</Link>
      <Link to="/profiles" style={itemStyle("/profiles")}>Customer Profiles</Link>
    </div>
  );
}
