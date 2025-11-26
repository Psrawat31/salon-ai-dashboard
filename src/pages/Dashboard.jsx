// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const cardStyle = {
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
};

export default function Dashboard() {
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  // Load customers from KV backend if not present in sessionStorage
  useEffect(() => {
    if (customers !== null) return;

    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await axios.get("/api/customers");
        setCustomers(res.data);
        sessionStorage.setItem("customers", JSON.stringify(res.data));
      } catch (err) {
        console.error("Dashboard: failed to fetch /api/customers", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [customers]);

  const today = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

    const safeCustomers = Array.isArray(customers) ? customers : [];
    const data = safeCustomers.map((c) => {
    const lastVisitDate = parseDate(c.lastVisit);
    const daysSinceLastVisit =
      lastVisitDate != null
        ? Math.floor((today - lastVisitDate) / MS_PER_DAY)
        : null;

    const contacted = String(c.contacted || "No").toLowerCase() === "yes";
    const revenue = Number(c.revenue || 0);

    const isHot =
      !contacted &&
      daysSinceLastVisit !== null &&
      daysSinceLastVisit >= 30 &&
      daysSinceLastVisit <= 180;

    return {
      ...c,
      lastVisitDate,
      daysSinceLastVisit,
      contacted,
      revenue,
      isHot,
    };
  });

  const totalCustomers = data.length;
  const totalRevenue = data.reduce((sum, c) => sum + c.revenue, 0);

  const contactedCustomers = data.filter((c) => c.contacted);
  const notContactedCustomers = data.filter((c) => !c.contacted);

  const contactedRevenue = contactedCustomers.reduce(
    (sum, c) => sum + c.revenue,
    0
  );
  const notContactedRevenue = notContactedCustomers.reduce(
    (sum, c) => sum + c.revenue,
    0
  );

  const hotCustomers = data.filter((c) => c.isHot);
  const hotRevenue = hotCustomers.reduce((sum, c) => sum + c.revenue, 0);

  const HIGH_VALUE_THRESHOLD = 1500;
  const highValueCustomers = data.filter(
    (c) => c.revenue >= HIGH_VALUE_THRESHOLD
  );
  const highValueNotContacted = highValueCustomers.filter(
    (c) => !c.contacted
  );

  const avgRevenuePerCustomer =
    totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  // Simple “AI” owner summary
  let ownerSummary = "No customer data yet. Upload a sheet to get started.";
  if (totalCustomers > 0) {
    const hotCount = hotCustomers.length;
    const hvn = highValueNotContacted.length;

    ownerSummary = `You have ${totalCustomers} customers in the system with total recorded revenue of ₹${totalRevenue.toLocaleString(
      "en-IN"
    )}. There are ${hotCount} hot rebooking opportunities worth ₹${hotRevenue.toLocaleString(
      "en-IN"
    )} and ${hvn} high-value customers who have not been contacted yet. Focus today on calling or messaging these customers to unlock quick, low-effort revenue.`;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "26px", marginBottom: "4px" }}>
        AI Dashboard (Owner View)
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Snapshot of how much money is coming in, how much is at risk, and where
        to focus today for maximum profit.
      </p>

      {loading && (
        <div style={{ marginBottom: "12px", color: "#6b7280" }}>
          Loading latest customer data…
        </div>
      )}

      {/* Top metric cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>TOTAL CUSTOMERS</div>
          <div style={{ fontSize: "30px", fontWeight: 600 }}>
            {totalCustomers}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>TOTAL RECORDED REVENUE</div>
          <div style={{ fontSize: "24px", fontWeight: 600 }}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Based on uploaded customer visits.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            AVERAGE REVENUE PER CUSTOMER
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600 }}>
            ₹{avgRevenuePerCustomer.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            REVENUE FROM CONTACTED CUSTOMERS
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600 }}>
            ₹{contactedRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            These customers already received attention.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            REVENUE AT RISK (NOT CONTACTED)
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "#b91c1c" }}>
            ₹{notContactedRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Reach-out campaigns here can directly boost cash flow.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            HOT REBOOKING CUSTOMERS TODAY
          </div>
          <div style={{ fontSize: "30px", fontWeight: 600 }}>
            {hotCustomers.length}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Worth ₹{hotRevenue.toLocaleString("en-IN")} in potential repeat revenue.
          </div>
        </div>
      </div>

      {/* High-value customers summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            HIGH-VALUE CUSTOMERS (≥ ₹{HIGH_VALUE_THRESHOLD})
          </div>
          <div style={{ fontSize: "28px", fontWeight: 600 }}>
            {highValueCustomers.length}
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Not contacted:{" "}
            <span style={{ fontWeight: 600 }}>{highValueNotContacted.length}</span>
          </div>
        </div>

        <div style={{ ...cardStyle, background: "#f9fafb" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            AI OWNER SUMMARY
          </div>
          <div style={{ color: "#374151", fontSize: "14px", lineHeight: 1.5 }}>
            {ownerSummary}
          </div>
        </div>
      </div>

      {/* Quick action suggestions */}
      <div style={{ marginTop: "8px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Today’s Suggested Actions
        </h3>
        {totalCustomers === 0 ? (
          <p style={{ color: "#6b7280" }}>
            Upload your customer data to unlock AI suggestions.
          </p>
        ) : (
          <ul style={{ color: "#4b5563", fontSize: "14px", paddingLeft: "18px" }}>
            <li>
              Call or message the <b>{hotCustomers.length}</b> hot customers and offer
              a time-limited rebooking deal.
            </li>
            <li>
              Create a VIP list of the{" "}
              <b>{highValueCustomers.length}</b> high-value customers and ensure they
              never churn.
            </li>
            <li>
              Plan a simple follow-up routine for the{" "}
              <b>{notContactedCustomers.length}</b> customers who haven’t been
              contacted recently.
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
