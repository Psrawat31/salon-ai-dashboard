import React from "react";
import { customers } from "../lib/customers";

export default function ServiceAnalytics() {
  const serviceCounts = {};

  customers.forEach((c) => {
    serviceCounts[c.serviceType] =
      (serviceCounts[c.serviceType] || 0) + 1;
  });

  return (
    <div>
      <h2>Service Analytics</h2>

      <p style={{ marginTop: "10px", marginBottom: "20px" }}>
        Which services generate more traffic and which have high drop-offs.
      </p>

      {Object.keys(serviceCounts).map((service) => (
        <div
          key={service}
          style={{
            background: "#fff",
            marginBottom: "10px",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            width: "350px",
          }}
        >
          <strong>{service}</strong>
          <p>Customers: {serviceCounts[service]}</p>
        </div>
      ))}
    </div>
  );
}
