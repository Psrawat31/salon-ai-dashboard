// src/pages/AIReminders.jsx
import React, { useEffect, useState } from "react";

export default function AIReminders({ darkMode }) {
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  const theme = {
    bg: darkMode ? "#020617" : "#f8fafc",
    card: darkMode ? "#0f172a" : "#ffffff",
    border: darkMode ? "#1e293b" : "#e5e7eb",
    text: darkMode ? "#f8fafc" : "#0f172a",
    sub: darkMode ? "#cbd5e1" : "#6b7280",
    highlightRed: darkMode ? "#7f1d1d" : "#fee2e2",
    highlightBlue: darkMode ? "#1e40af" : "#dbeafe",
    highlightYellow: darkMode ? "#78350f" : "#fef3c7",
  };

  // If no customers uploaded
  if (!customers) {
    return (
      <div style={{ padding: "24px", color: theme.text }}>
        <h1>AI Reminders</h1>
        <p style={{ color: theme.sub }}>
          Upload customer data first to generate reminder actions.
        </p>
      </div>
    );
  }

  const today = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Convert date
  const parseDate = (d) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  // Calculate metrics
  const enriched = customers.map((c) => {
    const last = parseDate(c.lastVisit);
    const days = last ? Math.floor((today - last) / MS_PER_DAY) : null;
    const contacted = String(c.contacted || "No").toLowerCase() === "yes";
    return {
      ...c,
      lastDate: last,
      daysSince: days,
      contacted,
      revenue: Number(c.revenue || 0),
    };
  });

  // Categories
  const urgentHighValue = enriched.filter(
    (c) => c.revenue >= 1500 && !c.contacted && c.daysSince > 30
  );

  const followUps = enriched.filter(
    (c) => !c.contacted && c.daysSince > 30 && c.revenue < 1500
  );

  const churnRisk = enriched.filter((c) => c.daysSince >= 120);

  // Card style generator
  const cardStyle = (bgColor) => ({
    background: bgColor,
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "20px",
    border: `1px solid ${theme.border}`,
    color: theme.text,
  });

  // Table header style
  const th = {
    fontSize: "14px",
    color: theme.sub,
    paddingBottom: "6px",
  };

  const td = {
    padding: "8px 0",
    fontSize: "15px",
    color: theme.text,
    borderBottom: `1px solid ${theme.border}`,
  };

  return (
    <div style={{ padding: "24px", color: theme.text }}>
      <h1 style={{ marginBottom: "6px" }}>AI Reminders</h1>
      <p style={{ color: theme.sub, marginBottom: "24px" }}>
        Genie automatically identifies customers who need attention today to
        maximize rebookings and prevent revenue loss.
      </p>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* Urgent */}
        <div style={{ ...cardStyle(theme.card) }}>
          <div style={{ color: theme.sub, fontSize: "12px" }}>
            Urgent — High Value & Overdue
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700 }}>
            {urgentHighValue.length}
          </div>
        </div>

        {/* Follow Up */}
        <div style={{ ...cardStyle(theme.card) }}>
          <div style={{ color: theme.sub, fontSize: "12px" }}>
            Follow-up Needed
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700 }}>
            {followUps.length}
          </div>
        </div>

        {/* Churn */}
        <div style={{ ...cardStyle(theme.card) }}>
          <div style={{ color: theme.sub, fontSize: "12px" }}>Churn Risk</div>
          <div style={{ fontSize: "32px", fontWeight: 700 }}>
            {churnRisk.length}
          </div>
        </div>
      </div>

      {/* URGENT HIGH VALUE */}
      <div style={cardStyle(theme.highlightRed)}>
        <h3 style={{ marginBottom: "12px", color: theme.text }}>
          🔥 Urgent — High-Value Customers (Action Needed Today)
        </h3>

        {urgentHighValue.length === 0 ? (
          <p style={{ color: theme.sub }}>No customers in this category.</p>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Service</th>
                <th style={th}>Last Visit</th>
                <th style={th}>Revenue</th>
                <th style={th}>Days Since Visit</th>
              </tr>
            </thead>
            <tbody>
              {urgentHighValue.map((c) => (
                <tr key={c.name}>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.service}</td>
                  <td style={td}>{c.lastVisit}</td>
                  <td style={td}>₹{c.revenue}</td>
                  <td style={td}>{c.daysSince}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* FOLLOW UP */}
      <div style={cardStyle(theme.highlightBlue)}>
        <h3 style={{ marginBottom: "12px", color: theme.text }}>
          📞 Follow-Up Customers
        </h3>

        {followUps.length === 0 ? (
          <p style={{ color: theme.sub }}>No customers in this category.</p>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Service</th>
                <th style={th}>Last Visit</th>
                <th style={th}>Revenue</th>
                <th style={th}>Days Since Visit</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((c) => (
                <tr key={c.name}>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.service}</td>
                  <td style={td}>{c.lastVisit}</td>
                  <td style={td}>₹{c.revenue}</td>
                  <td style={td}>{c.daysSince}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CHURN RISK */}
      <div style={cardStyle(theme.highlightYellow)}>
        <h3 style={{ marginBottom: "12px", color: theme.text }}>
          ⚠️ High Churn Risk (Haven’t Visited in 120+ Days)
        </h3>

        {churnRisk.length === 0 ? (
          <p style={{ color: theme.sub }}>No customers in this category.</p>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Service</th>
                <th style={th}>Last Visit</th>
                <th style={th}>Revenue</th>
                <th style={th}>Days Since Visit</th>
              </tr>
            </thead>
            <tbody>
              {churnRisk.map((c) => (
                <tr key={c.name}>
                  <td style={td}>{c.name}</td>
                  <td style={td}>{c.service}</td>
                  <td style={td}>{c.lastVisit}</td>
                  <td style={td}>₹{c.revenue}</td>
                  <td style={td}>{c.daysSince}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
