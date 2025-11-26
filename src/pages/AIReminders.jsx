// src/pages/AIReminders.jsx
import React, { useMemo, useState } from "react";

export default function AIReminders({ darkMode }) {
  const [customersState, setCustomersState] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  const theme = {
    pageBg: darkMode ? "#0b1120" : "#f9fafb",
    card: darkMode ? "#0f172a" : "#ffffff",
    border: darkMode ? "#1f2937" : "#e5e7eb",
    text: darkMode ? "#f9fafb" : "#0f172a",
    sub: darkMode ? "#cbd5e1" : "#6b7280",
    badgeUrgent: darkMode ? "#7f1d1d" : "#fee2e2",
    badgeFollow: darkMode ? "#1d4ed8" : "#dbeafe",
    badgeChurn: darkMode ? "#92400e" : "#ffedd5",
    tableHeaderBg: darkMode ? "#020617" : "#f3f4f6",
    buttonBg: darkMode ? "#1e293b" : "#e5e7eb",
    buttonBorder: darkMode ? "#334155" : "#cbd5e1",
  };

  if (!customersState || customersState.length === 0) {
    return (
      <div style={{ padding: "24px", color: theme.text }}>
        <h1 style={{ marginBottom: "8px" }}>AI Reminders</h1>
        <p style={{ color: theme.sub }}>
          Upload customer data first from <b>Upload Customers</b> to see AI-based
          follow-up suggestions.
        </p>
      </div>
    );
  }

  const today = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const enriched = useMemo(() => {
    return customersState.map((c, index) => {
      const lastDate = c.lastVisit ? new Date(c.lastVisit) : null;
      const daysSince =
        lastDate && !isNaN(lastDate.getTime())
          ? Math.floor((today - lastDate) / MS_PER_DAY)
          : null;

      const contacted =
        String(c.contacted || "No").toLowerCase() === "yes";

      return {
        ...c,
        _idx: index,
        lastDate,
        daysSince,
        contacted,
        revenue: Number(c.revenue || 0),
        phone: c.phone || c.Phone || "",
        service: c.service || c.Service || c.serviceType || "",
      };
    });
  }, [customersState]);

  const urgentHighValue = enriched.filter(
    (c) => c.revenue >= 1500 && !c.contacted && (c.daysSince ?? 0) >= 30
  );

  const followUps = enriched.filter(
    (c) =>
      !c.contacted &&
      (c.daysSince ?? 0) >= 30 &&
      (c.daysSince ?? 0) < 120 &&
      c.revenue < 1500
  );

  const churnRisk = enriched.filter(
    (c) => (c.daysSince ?? 0) >= 120
  );

  const totalUrgent = urgentHighValue.length;
  const totalFollow = followUps.length;
  const totalChurn = churnRisk.length;

  // ACTION HANDLERS
  const handleCall = (phone) => {
    if (!phone) {
      alert("No phone number available for this customer.");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsapp = (phone, name) => {
    if (!phone) {
      alert("No phone number available for this customer.");
      return;
    }
    const msg = encodeURIComponent(
      `Hi ${name || "there"}, this is from your salon.\nWe noticed it's been a while since your last visit. Would you like to book your next appointment?`
    );
    const cleanPhone = phone.replace(/\s+/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handleMarkContacted = (idx) => {
    const updated = customersState.map((c, i) =>
      i === idx ? { ...c, contacted: "Yes" } : c
    );
    setCustomersState(updated);
    sessionStorage.setItem("customers", JSON.stringify(updated));
    alert("Marked as contacted.");
  };

  const renderTable = (rows) => {
    if (rows.length === 0) {
      return (
        <p style={{ color: theme.sub, margin: 0 }}>
          No customers in this category.
        </p>
      );
    }

    const thStyle = {
      textAlign: "left",
      padding: "10px 8px",
      fontSize: "13px",
      color: theme.sub,
      background: theme.tableHeaderBg,
      borderBottom: `1px solid ${theme.border}`,
    };

    const tdStyle = {
      padding: "8px 8px",
      fontSize: "14px",
      color: theme.text,
      borderBottom: `1px solid ${theme.border}`,
      verticalAlign: "middle",
    };

    const actionBtn = {
      padding: "4px 8px",
      fontSize: "12px",
      borderRadius: "999px",
      border: `1px solid ${theme.buttonBorder}`,
      background: theme.buttonBg,
      color: theme.text,
      cursor: "pointer",
      marginRight: "6px",
      whiteSpace: "nowrap",
    };

    return (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Service</th>
            <th style={thStyle}>Last Visit</th>
            <th style={thStyle}>Revenue</th>
            <th style={thStyle}>Days Since</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={`${c.name}-${c._idx}`}>
              <td style={tdStyle}>{c.name}</td>
              <td style={tdStyle}>{c.service}</td>
              <td style={tdStyle}>{c.lastVisit || "-"}</td>
              <td style={tdStyle}>
                ₹{Number(c.revenue || 0).toLocaleString("en-IN")}
              </td>
              <td style={tdStyle}>{c.daysSince ?? "-"}</td>
              <td style={tdStyle}>
                <button
                  style={actionBtn}
                  onClick={() => handleCall(c.phone)}
                >
                  📞 Call
                </button>
                <button
                  style={actionBtn}
                  onClick={() => handleWhatsapp(c.phone, c.name)}
                >
                  💬 WhatsApp
                </button>
                {!c.contacted && (
                  <button
                    style={actionBtn}
                    onClick={() => handleMarkContacted(c._idx)}
                  >
                    ✅ Mark Contacted
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const metricCardStyle = {
    borderRadius: "14px",
    padding: "14px 16px",
    border: `1px solid ${theme.border}`,
    background: theme.card,
  };

  const metricNumberStyle = {
    fontSize: "26px",
    fontWeight: 700,
    color: theme.text,
  };

  const metricLabelStyle = {
    fontSize: "12px",
    color: theme.sub,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ padding: "24px", color: theme.text }}>
      <h1 style={{ marginBottom: "6px" }}>AI Reminders</h1>
      <p style={{ color: theme.sub, marginBottom: "20px" }}>
        Genie highlights customers to call or message today so you can maximise
        rebookings with minimal effort.
      </p>

      {/* SUMMARY METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>URGENT — HIGH VALUE & OVERDUE</div>
          <div style={metricNumberStyle}>{totalUrgent}</div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>FOLLOW-UP NEEDED</div>
          <div style={metricNumberStyle}>{totalFollow}</div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>CHURN RISK (120+ DAYS)</div>
          <div style={metricNumberStyle}>{totalChurn}</div>
        </div>
      </div>

      {/* URGENT HIGH VALUE */}
      <section
        style={{
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "14px",
          border: `1px solid ${theme.border}`,
          background: theme.badgeUrgent,
        }}
      >
        <h3 style={{ marginBottom: "8px", color: theme.text }}>
          🔥 Urgent — High-Value Customers (Action Today)
        </h3>
        <p style={{ color: theme.sub, marginTop: 0, marginBottom: "10px" }}>
          High-spend customers who are overdue and not yet contacted. Call or
          message them first.
        </p>
        {renderTable(urgentHighValue)}
      </section>

      {/* FOLLOW-UP */}
      <section
        style={{
          marginBottom: "20px",
          padding: "16px",
          borderRadius: "14px",
          border: `1px solid ${theme.border}`,
          background: theme.badgeFollow,
        }}
      >
        <h3 style={{ marginBottom: "8px", color: theme.text }}>
          📞 Follow-Up Customers
        </h3>
        <p style={{ color: theme.sub, marginTop: 0, marginBottom: "10px" }}>
          Customers who are due for a gentle follow-up but are not yet very
          high risk.
        </p>
        {renderTable(followUps)}
      </section>

      {/* CHURN RISK */}
      <section
        style={{
          marginBottom: "0px",
          padding: "16px",
          borderRadius: "14px",
          border: `1px solid ${theme.border}`,
          background: theme.badgeChurn,
        }}
      >
        <h3 style={{ marginBottom: "8px", color: theme.text }}>
          ⚠️ High Churn Risk (120+ Days Since Visit)
        </h3>
        <p style={{ color: theme.sub, marginTop: 0, marginBottom: "10px" }}>
          Customers who may never return unless you reach out with a special
          offer or reminder.
        </p>
        {renderTable(churnRisk)}
      </section>
    </div>
  );
}
