// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const theme = (dark) => ({
  cardBg: dark ? "#0b1120" : "#ffffff",
  cardBorder: dark ? "#1f2937" : "#e5e7eb",
  cardText: dark ? "#e5e7eb" : "#111827",
  label: dark ? "#cbd5e1" : "#6b7280",
  muted: dark ? "#9ca3af" : "#9ca3af",
  danger: dark ? "#fecaca" : "#b91c1c",
});

const cardContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

export default function Dashboard({ darkMode = false }) {
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  // Fetch from /api/customers if not in sessionStorage
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

  const t = theme(darkMode);

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        Loading dashboard…
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
          AI Dashboard (Owner View)
        </h1>
        <p style={{ color: t.muted, marginBottom: "16px" }}>
          Upload customer data to see your AI insights.
        </p>
        <p style={{ color: t.muted }}>
          Go to <b>Upload Customers</b> and add your Excel sheet first.
        </p>
      </div>
    );
  }

  const today = new Date();

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // Enrich customers with metrics
  const data = customers.map((c) => {
    const lastVisitDate = parseDate(c.lastVisit);
    const daysSinceLastVisit =
      lastVisitDate != null
        ? Math.floor((today - lastVisitDate) / MS_PER_DAY)
        : null;

    const contacted =
      String(c.contacted || "No").toLowerCase() === "yes";
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
  const totalRevenue = data.reduce(
    (sum, c) => sum + c.revenue,
    0
  );

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
  const hotRevenue = hotCustomers.reduce(
    (sum, c) => sum + c.revenue,
    0
  );

  const HIGH_VALUE_THRESHOLD = 1500;
  const highValueCustomers = data.filter(
    (c) => c.revenue >= HIGH_VALUE_THRESHOLD
  );
  const highValueNotContacted = highValueCustomers.filter(
    (c) => !c.contacted
  );

  const avgRevenuePerCustomer =
    totalCustomers > 0
      ? Math.round(totalRevenue / totalCustomers)
      : 0;

  let ownerSummary =
    "No customer data yet. Upload a sheet to get started.";
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
    <div>
      <h1
        style={{
          fontSize: "26px",
          marginBottom: "4px",
        }}
      >
        AI Dashboard (Owner View)
      </h1>
      <p
        style={{
          color: t.muted,
          marginBottom: "24px",
        }}
      >
        Snapshot of how much money is coming in, how much is at risk,
        and where to focus today for maximum profit.
      </p>

      {/* Top metric cards */}
      <div style={cardContainerStyle}>
        {/* TOTAL CUSTOMERS */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: t.label,
              marginBottom: "6px",
            }}
          >
            TOTAL CUSTOMERS
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            {totalCustomers}
          </div>
        </div>

        {/* TOTAL RECORDED REVENUE */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{ fontSize: "12px", color: t.label }}
          >
            TOTAL RECORDED REVENUE
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.muted,
              marginTop: "4px",
            }}
          >
            Based on uploaded customer visits.
          </div>
        </div>

        {/* AVG REVENUE */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{ fontSize: "12px", color: t.label }}
          >
            AVERAGE REVENUE PER CUSTOMER
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            ₹{avgRevenuePerCustomer.toLocaleString("en-IN")}
          </div>
        </div>

        {/* REVENUE FROM CONTACTED */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{ fontSize: "12px", color: t.label }}
          >
            REVENUE FROM CONTACTED CUSTOMERS
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            ₹{contactedRevenue.toLocaleString("en-IN")}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.muted,
              marginTop: "4px",
            }}
          >
            These customers already received attention.
          </div>
        </div>

        {/* REVENUE AT RISK */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{ fontSize: "12px", color: t.label }}
          >
            REVENUE AT RISK (NOT CONTACTED)
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: t.danger,
            }}
          >
            ₹{notContactedRevenue.toLocaleString("en-IN")}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.muted,
              marginTop: "4px",
            }}
          >
            Reach-out campaigns here can directly boost cash flow.
          </div>
        </div>

        {/* HOT REBOOKING CUSTOMERS */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{ fontSize: "12px", color: t.label }}
          >
            HOT REBOOKING CUSTOMERS TODAY
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            {hotCustomers.length}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.muted,
              marginTop: "4px",
            }}
          >
            Worth ₹{hotRevenue.toLocaleString(
              "en-IN"
            )} in potential repeat revenue.
          </div>
        </div>
      </div>

      {/* High-value & summary section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* High value customers */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: t.label,
            }}
          >
            HIGH-VALUE CUSTOMERS (≥ ₹{HIGH_VALUE_THRESHOLD})
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: t.cardText,
            }}
          >
            {highValueCustomers.length}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: t.muted,
              marginTop: "4px",
            }}
          >
            Not contacted:{" "}
            <span style={{ fontWeight: 600 }}>
              {highValueNotContacted.length}
            </span>
          </div>
        </div>

        {/* Owner summary */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: t.label,
              marginBottom: "4px",
              textTransform: "uppercase",
            }}
          >
            AI OWNER SUMMARY
          </div>
          <div
            style={{
              color: t.cardText,
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {ownerSummary}
          </div>
        </div>
      </div>

      {/* Suggested actions */}
      <div style={{ marginTop: "8px" }}>
        <h3
          style={{
            fontSize: "18px",
            marginBottom: "8px",
          }}
        >
          Today’s Suggested Actions
        </h3>
        <ul
          style={{
            color: t.cardText,
            fontSize: "14px",
            paddingLeft: "18px",
          }}
        >
          <li>
            Call or message the{" "}
            <b>{hotCustomers.length}</b> hot customers and
            offer a time-limited rebooking deal.
          </li>
          <li>
            Create a VIP list of the{" "}
            <b>{highValueCustomers.length}</b> high-value
            customers and ensure they never churn.
          </li>
          <li>
            Plan a simple follow-up routine for the{" "}
            <b>{notContactedCustomers.length}</b> customers
            who haven’t been contacted recently.
          </li>
        </ul>
      </div>
    </div>
  );
}
