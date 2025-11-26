import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const route = useLocation().pathname;

  const itemStyle = (path) => ({
    padding: "12px 18px",
    borderRadius: "8px",
    marginBottom: "8px",
    background: route === path ? "#e5e7eb" : "transparent",
    fontWeight: route === path ? 600 : 400,
    cursor: "pointer",
    color: "#111",
    textDecoration: "none",
    display: "block",
  });

  return (
    <div
      style={{
        width: "230px",
        borderRight: "1px solid #e5e7eb",
        padding: "25px 20px",
        background: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "25px" }}>AI Dashboard</h2>

      <Link to="/" style={itemStyle("/")}>
        Dashboard
      </Link>

      <Link to="/upload" style={itemStyle("/upload")}>
        Upload Customers
      </Link>

      <Link to="/summary" style={itemStyle("/summary")}>
        Daily Summary
      </Link>

      <Link to="/reminders" style={itemStyle("/reminders")}>
        AI Reminders
      </Link>

      <Link to="/analytics" style={itemStyle("/analytics")}>
        Service Analytics
      </Link>

      <Link to="/profiles" style={itemStyle("/profiles")}>
        Customer Profiles
      </Link>
    </div>
  );
}
