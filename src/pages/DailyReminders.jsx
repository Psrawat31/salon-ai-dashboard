import React, { useState, useEffect } from "react";
import { customers } from "../lib/customers";
import { scoreCustomerForRebooking } from "../lib/rebookingEngine";
import { generateSmartMessage } from "../lib/messageGenerator";
import { getBestContactTime } from "../lib/timingEngine";
import { getFollowUpDate, needsFollowUp } from "../lib/followUpEngine";

// Helper to load contact logs safely
function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem("contactLogs")) || {};
  } catch {
    return {};
  }
}

function DailyReminders() {
  const [contactStatus, setContactStatus] = useState({});

  useEffect(() => {
    setContactStatus(loadLogs());
  }, []);

  // Run AI scoring
  const scored = customers.map((c) => {
    const result = scoreCustomerForRebooking(c);
    return { ...c, ...result };
  });

  const hotCustomers = scored
    .filter((c) => c.priorityLabel === "Hot")
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const today = new Date();
  const contactedToday = hotCustomers.filter((c) => {
    const entry = contactStatus[c.id];
    if (!entry) return false;

    const t = new Date(entry.time);
    return (
      t.getFullYear() === today.getFullYear() &&
      t.getMonth() === today.getMonth() &&
      t.getDate() === today.getDate()
    );
  });

  const stillToContact = hotCustomers.length - contactedToday.length;
  const estimatedRevenue = hotCustomers.reduce(
    (sum, c) => sum + (c.totalRevenue || 0),
    0
  );

  const th = {
    textAlign: "left",
    padding: "12px 8px",
    fontWeight: 600,
    borderBottom: "2px solid #e5e7eb",
  };

  const td = {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
  };

  const btn = {
    background: "#0BA360",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "10px" }}>Today’s AI Rebooking Reminders</h2>
      <p style={{ marginBottom: "20px" }}>
        These <strong>HIGH-CHANCE</strong> customers are most likely to rebook
        if you contact them today.
      </p>

      {/* 🔥 MISSED REVENUE ALERT (Profit Booster #7) */}
      {hotCustomers.some((c) => needsFollowUp(c, contactStatus)) && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "25px",
            color: "#991b1b",
          }}
        >
          <strong>🚨 Missed Revenue Alert:</strong> Some high-value customers
          have not been contacted for over 48 hours. Following up today may
          recover significant revenue.
        </div>
      )}

      {/* KPI BAR */}
      <div style={{ display: "flex", gap: "25px", marginBottom: "35px" }}>
        <div>
          <strong>HOT CUSTOMERS TODAY</strong>
          <div style={{ fontSize: "22px" }}>{hotCustomers.length}</div>
        </div>

        <div>
          <strong>CONTACTED TODAY</strong>
          <div style={{ fontSize: "22px" }}>{contactedToday.length}</div>
        </div>

        <div>
          <strong>STILL TO CONTACT</strong>
          <div style={{ fontSize: "22px" }}>{stillToContact}</div>
        </div>

        <div>
          <strong>ESTIMATED REVENUE TO RECOVER</strong>
          <div style={{ fontSize: "22px" }}>
            ₹{estimatedRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Service</th>
            <th style={th}>Days Overdue</th>
            <th style={th}>Score</th>
            <th style={th}>Status</th>
            <th style={th}>Best Time</th>
            <th style={th}>WhatsApp</th>
          </tr>
        </thead>

        <tbody>
          {hotCustomers.map((c) => {
            const statusEntry = contactStatus[c.id];

            return (
              <tr key={c.id}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.serviceType}</td>
                <td style={td}>{c.daysOverdue}</td>
                <td style={td}>{c.priorityScore}</td>

                {/* STATUS + Follow-up date */}
                <td style={td}>
                  {statusEntry ? (
                    <span style={{ color: "#15803d", fontWeight: 600 }}>
                      Contacted Today
                    </span>
                  ) : (
                    <span style={{ color: "#b91c1c" }}>
                      Not contacted yet
                      <br />
                      <small style={{ color: "#6b7280" }}>
                        Follow-up: {getFollowUpDate()}
                      </small>
                    </span>
                  )}
                </td>

                {/* BEST TIME */}
                <td style={td}>{getBestContactTime(c)}</td>

                {/* WHATSAPP BUTTON */}
                <td style={{ ...td, textAlign: "right" }}>
                  <button
                    style={btn}
                    onClick={() => {
                      const phone = c.phone.replace(/\D/g, "");
                      const msg = encodeURIComponent(generateSmartMessage(c));
                      const url = `https://wa.me/${phone}?text=${msg}`;
                      window.open(url, "_blank");

                      // Save log
                      const logs = loadLogs();
                      logs[c.id] = {
                        status: "Contacted Today",
                        time: new Date().toISOString(),
                      };
                      localStorage.setItem("contactLogs", JSON.stringify(logs));
                      setContactStatus({ ...logs });
                    }}
                  >
                    Send WhatsApp
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DailyReminders;
