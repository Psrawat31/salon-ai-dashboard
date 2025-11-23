import React from "react";
import { customers } from "../lib/customers";
import { scoreCustomerForRebooking } from "../lib/rebookingEngine";

export default function Performance() {
  const scored = customers.map((c) => ({
    ...c,
    ...scoreCustomerForRebooking(c),
  }));

  const totalHot = scored.filter((c) => c.priorityLabel === "Hot").length;

  return (
    <div>
      <h2>Employee Performance</h2>

      <p style={{ marginTop: "10px", marginBottom: "20px" }}>
        Track contacts, follow-ups, and revenue recovery metrics.
      </p>

      <div
        style={{
          padding: "25px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          background: "#fff",
          width: "320px",
        }}
      >
        <h3>Total Hot Customers</h3>
        <p style={{ fontSize: "22px", marginTop: "10px" }}>{totalHot}</p>
      </div>
    </div>
  );
}
