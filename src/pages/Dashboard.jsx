import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: "15px" }}>
        Welcome to Salon AI Command Center
      </h2>

      <p style={{ fontSize: "16px", marginBottom: "18px", color: "#4b5563" }}>
        Track your customers, rebook smarter, and recover revenue daily using
        AI-driven reminders and insights.
      </p>

      {/* Daily summary banner */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "14px 16px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <strong>📊 Your AI daily summary is ready.</strong>{" "}
        <span>See today’s rebooking opportunities and at-risk revenue.</span>{" "}
        <Link to="/daily-summary" style={{ marginLeft: "8px" }}>
          View summary →
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "260px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3>AI Rebooking Engine</h3>
          <p>Predicts who will rebook & increases conversions.</p>
        </div>

        <div
          style={{
            width: "260px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3>Smart WhatsApp</h3>
          <p>Personalized message templates auto-generated.</p>
        </div>

        <div
          style={{
            width: "260px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3>Performance Insights</h3>
          <p>Track daily contacts & efficiency.</p>
        </div>
      </div>
    </div>
  );
}
