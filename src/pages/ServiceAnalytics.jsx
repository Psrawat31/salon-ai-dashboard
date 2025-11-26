// src/pages/ServiceAnalytics.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ServiceAnalytics({ darkMode }) {
  const stored = sessionStorage.getItem("customers");
  const customers = stored ? JSON.parse(stored) : [];

  const theme = {
    bg: darkMode ? "#020617" : "#f9fafb",
    card: darkMode ? "#0f172a" : "#ffffff",
    border: darkMode ? "#1e293b" : "#e5e7eb",
    text: darkMode ? "#e2e8f0" : "#0f172a",
    sub: darkMode ? "#94a3b8" : "#6b7280",
    grid: darkMode ? "#1e293b" : "#e5e7eb",
    barRevenue: "#38bdf8",
    barVisits: "#22c55e",
  };

  if (!customers || customers.length === 0) {
    return (
      <div style={{ padding: "24px", color: theme.text }}>
        <h1>Service Analytics</h1>
        <p style={{ color: theme.sub }}>
          Upload customer data first to see which services bring the most revenue
          and visits.
        </p>
      </div>
    );
  }

  const serviceMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      const service =
        c.service ||
        c.Service ||
        c.serviceType ||
        c.ServiceType ||
        "Unknown";
      const revenue = Number(c.revenue || c.Revenue || 0);

      if (!map[service]) {
        map[service] = {
          service,
          revenue: 0,
          visits: 0,
        };
      }
      map[service].revenue += revenue;
      map[service].visits += 1;
    });
    return map;
  }, [customers]);

  const serviceList = Object.values(serviceMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  const totalRevenue = serviceList.reduce(
    (sum, s) => sum + s.revenue,
    0
  );
  const totalVisits = serviceList.reduce(
    (sum, s) => sum + s.visits,
    0
  );

  const topService = serviceList[0];
  const topByVisits = [...serviceList].sort(
    (a, b) => b.visits - a.visits
  )[0];

  const cardStyle = {
    padding: "16px",
    borderRadius: "14px",
    background: theme.card,
    border: `1px solid ${theme.border}`,
  };

  const labelStyle = {
    fontSize: "12px",
    color: theme.sub,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  };

  const numberStyle = {
    fontSize: "24px",
    fontWeight: 700,
    color: theme.text,
  };

  const subTextStyle = {
    fontSize: "13px",
    color: theme.sub,
    marginTop: "4px",
  };

  const chartCardStyle = {
    padding: "16px",
    borderRadius: "14px",
    background: theme.card,
    border: `1px solid ${theme.border}`,
    height: "360px",
  };

  return (
    <div style={{ padding: "24px", color: theme.text }}>
      <h1 style={{ marginBottom: "6px" }}>Service Analytics</h1>
      <p style={{ color: theme.sub, marginBottom: "20px" }}>
        Understand which services drive the most revenue and repeat visits so you
        can design better offers and packages.
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
        <div style={cardStyle}>
          <div style={labelStyle}>TOTAL SERVICE REVENUE</div>
          <div style={numberStyle}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div style={subTextStyle}>
            Across {serviceList.length} different services.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>TOTAL SERVICE VISITS</div>
          <div style={numberStyle}>{totalVisits}</div>
          <div style={subTextStyle}>
            Each visit is counted once per service line.
          </div>
        </div>

        {topService && (
          <div style={cardStyle}>
            <div style={labelStyle}>TOP SERVICE BY REVENUE</div>
            <div style={numberStyle}>{topService.service}</div>
            <div style={subTextStyle}>
              ₹{topService.revenue.toLocaleString("en-IN")} from{" "}
              {topService.visits} visits.
            </div>
          </div>
        )}

        {topByVisits && (
          <div style={cardStyle}>
            <div style={labelStyle}>MOST POPULAR SERVICE (VISITS)</div>
            <div style={numberStyle}>{topByVisits.service}</div>
            <div style={subTextStyle}>
              {topByVisits.visits} visits,
              {" "}
              ₹{topByVisits.revenue.toLocaleString("en-IN")} revenue.
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div style={chartCardStyle}>
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={labelStyle}>SERVICE PERFORMANCE</div>
            <div style={{ fontSize: "14px", color: theme.sub }}>
              Compare revenue and visit counts by service.
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serviceList} margin={{ top: 16, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="service"
              tick={{ fill: theme.sub, fontSize: 12 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: theme.sub, fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: theme.sub, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: theme.card,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{
                color: theme.sub,
                fontSize: "12px",
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              name="Revenue (₹)"
              fill={theme.barRevenue}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="visits"
              name="Visits"
              fill={theme.barVisits}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
