// src/pages/AIReminders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AIReminders() {
  const [customers, setCustomers] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : [];
  });

  const [loading, setLoading] = useState(false);

  // Fetch customers from KV if not in sessionStorage
  useEffect(() => {
    if (customers.length > 0) return;

    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await axios.get("/api/customers");
        const data = Array.isArray(res.data) ? res.data : [];
        setCustomers(data);
        sessionStorage.setItem("customers", JSON.stringify(data));
      } catch (error) {
        console.error("AI Reminders: failed to fetch /api/customers", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [customers]);

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading reminders…</div>;
  }

  if (!Array.isArray(customers) || customers.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        Upload customer data to generate AI reminders.
      </div>
    );
  }

  const today = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // SAFE customers list
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Process and categorize reminders
  const processed = safeCustomers.map((c) => {
    const lastVisit = parseDate(c.lastVisit);
    const daysSinceLastVisit =
      lastVisit != null
        ? Math.floor((today - lastVisit) / MS_PER_DAY)
        : null;

    const contacted = String(c.contacted || "No").toLowerCase() === "yes";
    const revenue = Number(c.revenue || 0);
    const isHighValue = revenue >= 1500;

    const dueForFollowUp =
      !contacted && daysSinceLastVisit !== null && daysSinceLastVisit >= 30;

    const urgent =
      !contacted &&
      isHighValue &&
      daysSinceLastVisit !== null &&
      daysSinceLastVisit > 45;

    const churnRisk =
      !contacted &&
      daysSinceLastVisit !== null &&
      daysSinceLastVisit >= 120;

    return {
      ...c,
      lastVisitDate: lastVisit,
      daysSinceLastVisit,
      contacted,
      isHighValue,
      revenue,
      dueForFollowUp,
      urgent,
      churnRisk,
    };
  });

  // Categories for UI
  const urgentList = processed.filter((c) => c.urgent);
  const followUpList = processed.filter((c) => c.dueForFollowUp);
  const churnRiskList = processed.filter((c) => c.churnRisk);

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "4px" }}>AI Reminders</h2>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>
        Genie automatically identifies customers who need attention today to
        maximize rebookings and prevent revenue loss.
      </p>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Card
          label="Urgent — High Value & Overdue"
          count={urgentList.length}
          color="#dc2626"
        />
        <Card label="Follow-up Needed" count={followUpList.length} color="#2563eb" />
        <Card label="Churn Risk" count={churnRiskList.length} color="#b45309" />
      </div>

      <Section
        title="🔥 Urgent — High-Value Customers (Action Needed Today)"
        color="#fee2e2"
        border="#fecaca"
        list={urgentList}
      />

      <Section
        title="📞 Follow-Up Customers"
        color="#eff6ff"
        border="#bfdbfe"
        list={followUpList}
      />

      <Section
        title="⚠️ High Churn Risk (Haven’t Visited in 120+ Days)"
        color="#fff7ed"
        border="#fed7aa"
        list={churnRiskList}
      />
    </div>
  );
}

/* -------------------------------------------
   Reusable Card Component
-------------------------------------------- */
function Card({ label, count, color }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 600,
          color: color,
          marginTop: "6px",
        }}
      >
        {count}
      </div>
    </div>
  );
}

/* -------------------------------------------
   Section Component
-------------------------------------------- */
function Section({ title, list, color, border }) {
  return (
    <div
      style={{
        marginBottom: "32px",
        padding: "16px",
        borderRadius: "12px",
        background: color,
        border: `1px solid ${border}`,
      }}
    >
      <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>{title}</h3>

      {list.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No customers in this category.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Service</th>
              <th style={{ textAlign: "left", padding: "8px" }}>Last Visit</th>
              <th style={{ textAlign: "right", padding: "8px" }}>Revenue</th>
              <th style={{ textAlign: "right", padding: "8px" }}>
                Days Since Visit
              </th>
            </tr>
          </thead>

          <tbody>
            {list.map((c, index) => (
              <tr key={index}>
                <td style={{ padding: "8px" }}>{c.name}</td>
                <td style={{ padding: "8px" }}>{c.service}</td>
                <td style={{ padding: "8px" }}>{c.lastVisit}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  ₹{Number(c.revenue).toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {c.daysSinceLastVisit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
