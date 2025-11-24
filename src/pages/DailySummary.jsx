import React from "react";

export default function DailySummary({ customers }) {
  // 🔥 Ensure we always try to read from localStorage as backup
  let effectiveCustomers = Array.isArray(customers) ? customers : [];

  if (
    (!effectiveCustomers || effectiveCustomers.length === 0) &&
    typeof window !== "undefined"
  ) {
    try {
      const stored = window.localStorage.getItem("customers");
      if (stored) {
        effectiveCustomers = JSON.parse(stored);
      }
    } catch (err) {
      console.error("Failed to read customers from localStorage in DailySummary", err);
    }
  }

  console.log("Daily Summary Using:", effectiveCustomers);

  if (!effectiveCustomers || effectiveCustomers.length === 0) {
    return (
      <div>
        <h2>Daily AI Summary</h2>
        <p>No customer data available. Please upload customer sheet first.</p>
      </div>
    );
  }

  const today = new Date();

  // High-value, overdue, not yet contacted → HOT customers
  const hotCustomers = effectiveCustomers.filter((c) => {
    const lastVisit = c.lastVisit || c.lastvisit || c.LastVisit;
    if (!lastVisit) return false;

    const diffDays =
      (today - new Date(lastVisit)) / (1000 * 60 * 60 * 24);

    const contacted = (c.contacted || c.Contacted || "").toString().toLowerCase();
    const isNotContacted = contacted !== "yes";

    return diffDays > 30 && isNotContacted;
  });

  const contactedCustomers = effectiveCustomers.filter((c) => {
    const contacted = (c.contacted || c.Contacted || "").toString().toLowerCase();
    return contacted === "yes";
  });

  const notContacted = effectiveCustomers.filter((c) => {
    const contacted = (c.contacted || c.Contacted || "").toString().toLowerCase();
    return contacted !== "yes";
  });

  const potentialRevenue = hotCustomers.reduce(
    (sum, c) => sum + Number(c.revenue || c.Revenue || 0),
    0
  );

  const contactedRevenue = contactedCustomers.reduce(
    (sum, c) => sum + Number(c.revenue || c.Revenue || 0),
    0
  );

  return (
    <div>
      <h2>Daily AI Summary</h2>

      {/* KPI cards */}
      <div className="stats-row" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div className="stat-card">
          <h4>HOT CUSTOMERS TODAY</h4>
          <p>{hotCustomers.length}</p>
        </div>

        <div className="stat-card">
          <h4>CONTACTED CUSTOMERS</h4>
          <p>{contactedCustomers.length}</p>
        </div>

        <div className="stat-card">
          <h4>STILL TO CONTACT</h4>
          <p>{notContacted.length}</p>
        </div>

        <div className="stat-card">
          <h4>POTENTIAL REPEAT REVENUE</h4>
          <p>₹{potentialRevenue}</p>
        </div>

        <div className="stat-card">
          <h4>REVENUE FROM CONTACTED</h4>
          <p>₹{contactedRevenue}</p>
        </div>
      </div>

      {/* AI Summary box */}
      <div
        className="ai-summary-box"
        style={{
          marginTop: "24px",
          padding: "16px",
          borderRadius: "8px",
          background: "#f3f4ff",
        }}
      >
        {hotCustomers.length === 0 ? (
          <p>
            AI didn&apos;t find urgent high-priority rebooking customers today. Focus on
            premium services, upsells, and creating memorable experiences for walk-ins.
          </p>
        ) : (
          <p>
            AI identified <strong>{hotCustomers.length}</strong> high-priority customers
            overdue for rebooking. Contacting them can unlock approximately{" "}
            <strong>₹{potentialRevenue}</strong> in repeat revenue. Prioritise these
            customers for calls, WhatsApp reminders, or special offers.
          </p>
        )}
      </div>

      {/* Follow-up Priority List */}
      <h3 style={{ marginTop: "24px" }}>Follow-up Priority List</h3>

      {hotCustomers.length === 0 ? (
        <p>✅ No pending high-priority follow-ups. You&apos;re fully caught up!</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "12px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Last Visit</th>
              <th>Service</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {hotCustomers.map((c, index) => (
              <tr key={index}>
                <td>{c.name || c.Name}</td>
                <td>{c.lastVisit || c.lastvisit || c.LastVisit}</td>
                <td>{c.service || c.Service}</td>
                <td>{c.revenue || c.Revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
