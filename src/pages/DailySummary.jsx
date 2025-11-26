// src/pages/DailySummary.jsx
import React, { useMemo } from "react";

export default function DailySummary({ darkMode }) {
  const stored = sessionStorage.getItem("customers");
  const customers = stored ? JSON.parse(stored) : [];

  const theme = {
    bg: darkMode ? "#0b1120" : "#f9fafb",
    card: darkMode ? "#0f172a" : "#ffffff",
    border: darkMode ? "#1e293b" : "#e5e7eb",
    text: darkMode ? "#e2e8f0" : "#0f172a",
    sub: darkMode ? "#94a3b8" : "#6b7280",
    highlight: darkMode ? "#1e293b" : "#f3f4f6",
  };

  if (customers.length === 0) {
    return (
      <div style={{ padding: "24px", color: theme.text }}>
        <h1>Daily Summary</h1>
        <p style={{ color: theme.sub }}>
          Upload customer data first to generate your summary.
        </p>
      </div>
    );
  }

  const today = new Date();
  const MS = 1000 * 60 * 60 * 24;

  const enriched = useMemo(() => {
    return customers.map((c) => {
      const lastDate = c.lastVisit ? new Date(c.lastVisit) : null;
      const days = lastDate ? Math.floor((today - lastDate) / MS) : null;
      return {
        ...c,
        revenue: Number(c.revenue || c.Revenue || 0),
        service: c.service || c.Service || c.serviceType || "",
        contacted: String(c.contacted || "No").toLowerCase() === "yes",
        lastDate,
        days,
      };
    });
  }, [customers]);

  const totalRevenue = enriched.reduce((s, c) => s + c.revenue, 0);
  const highValue = enriched.filter((c) => c.revenue >= 1500);
  const hot = enriched.filter(
    (c) => !c.contacted && c.days >= 30 && c.days <= 180
  );
  const churn = enriched.filter((c) => c.days >= 120);

  // Top 3 recommended actions (AI style)
  const suggestions = [
    `Call ${hot.length} hot customers today — they are easy wins.`,
    `Send a VIP message to your ${highValue.length} high-value customers.`,
    `Churn risk: ${churn.length} customers haven't visited in 120+ days.`,
  ];

  const card = (label, value) => (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div style={{ fontSize: "12px", color: theme.sub }}>{label}</div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: theme.text,
          marginTop: "6px",
        }}
      >
        {value}
      </div>
    </div>
  );

  const renderTable = (title, list) => (
    <section
      style={{
        marginBottom: "24px",
        padding: "16px",
        borderRadius: "14px",
        background: theme.card,
        border: `1px solid ${theme.border}`,
      }}
    >
      <h3 style={{ color: theme.text }}>{title}</h3>

      {list.length === 0 ? (
        <p style={{ color: theme.sub }}>None for today.</p>
      ) : (
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: theme.highlight }}>
              <th style={th}>Name</th>
              <th style={th}>Service</th>
              <th style={th}>Last Visit</th>
              <th style={th}>Revenue</th>
              <th style={th}>Days Since Visit</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={i}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.service}</td>
                <td style={td}>{c.lastVisit || "-"}</td>
                <td style={td}>
                  ₹{Number(c.revenue).toLocaleString("en-IN")}
                </td>
                <td style={td}>{c.days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  const th = {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: "13px",
    color: theme.sub,
    borderBottom: `1px solid ${theme.border}`,
  };

  const td = {
    padding: "8px",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
  };

  return (
    <div style={{ padding: "24px", color: theme.text }}>
      <h1 style={{ marginBottom: "4px" }}>Daily Summary</h1>
      <p style={{ color: theme.sub, marginBottom: "20px" }}>
        Here's your personalised summary for today, based on all customer visits.
      </p>

      {/* Top metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {card("Total Customers", enriched.length)}
        {card("Total Revenue", `₹${totalRevenue.toLocaleString("en-IN")}`)}
        {card("High-Value Customers (₹1500+)", highValue.length)}
        {card("Hot Leads (30–180 days)", hot.length)}
        {card("Churn Risk (120+ days)", churn.length)}
      </div>

      {/* Suggestions */}
      <section
        style={{
          marginBottom: "24px",
          padding: "16px",
          borderRadius: "14px",
          background: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h3 style={{ marginBottom: "10px", color: theme.text }}>
          Today’s Suggested Actions
        </h3>
        <ul style={{ paddingLeft: "20px", color: theme.text }}>
          {suggestions.map((s, i) => (
            <li key={i} style={{ marginBottom: "6px", color: theme.sub }}>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {renderTable("🔥 Hot Rebooking Opportunities", hot)}
      {renderTable("💎 High-Value Customers", highValue)}
      {renderTable("⚠️ Churn Risk Customers", churn)}
    </div>
  );
}
