import React from "react";
import { customers } from "../lib/customers";
import { getRebookingRecommendations } from "../lib/rebookingEngine";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function SmartRebooking() {
  const recommendations = getRebookingRecommendations(customers);

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "16px" }}>
        Smart Rebooking Engine
      </h1>

      <p style={{ marginBottom: "24px", color: "#555" }}>
        AI-ranked customers most likely to rebook if you contact them today.
        Start with <strong>Hot</strong> customers to boost revenue instantly.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Service</th>
            <th style={thStyle}>Last Visit</th>
            <th style={thStyle}>Days Overdue</th>
            <th style={thStyle}>Total Revenue (₹)</th>
            <th style={thStyle}>Priority</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {recommendations.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>{c.name}</td>
              <td style={tdStyle}>{c.serviceType}</td>
              <td style={tdStyle}>{formatDate(c.lastVisit)}</td>
              <td style={tdStyle}>{c.daysOverdue}</td>
              <td style={tdStyle}>{c.totalRevenue.toLocaleString("en-IN")}</td>

              <td style={tdStyle}>
                <PriorityBadge label={c.priorityLabel} score={c.priorityScore} />
              </td>

              <td style={tdStyle}>

<button
  style={btnStyle}
  onClick={() => {
    const phone = c.phone.replace(/\D/g, ""); 
    const encoded = encodeURIComponent(c.suggestedMessage);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, "_blank");
  }}
>
  Send WhatsApp Message
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: "14px",
  color: "#555",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
};

const btnStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
};

function PriorityBadge({ label, score }) {
  let bg = "#e0e7ff";
  let color = "#1e3a8a";

  if (label === "Hot") {
    bg = "#fee2e2";
    color = "#b91c1c";
  } else if (label === "Cold") {
    bg = "#e5e7eb";
    color = "#374151";
  }

  return (
    <span
      style={{
        background: bg,
        color,
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {label} • {score}
    </span>
  );
}
