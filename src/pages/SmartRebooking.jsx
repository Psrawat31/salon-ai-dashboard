// src/pages/SmartRebooking.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SmartRebooking() {
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [minScore, setMinScore] = useState(40);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (customers !== null) return;

    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await axios.get("/api/customers");
        setCustomers(res.data);
        sessionStorage.setItem("customers", JSON.stringify(res.data));
      } catch (err) {
        console.error("SmartRebooking: failed to fetch", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [customers]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!customers) return <div style={{ padding: 20 }}>Upload data first.</div>;

  const today = new Date();
  const MS_PER_DAY = 86400000;

  const parseDate = (v) => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const scored = customers.map((c) => {
    const last = parseDate(c.lastVisit);
    const days = last ? Math.floor((today - last) / MS_PER_DAY) : null;

    const rev = Number(c.revenue || 0);
    const contacted = String(c.contacted || "No").toLowerCase() === "yes";

    let score = 0;

    if (days == null) score += 10;
    else if (days <= 20) score += 20;
    else if (days <= 45) score += 40;
    else if (days <= 120) score += 30;
    else score += 15;

    if (rev >= 3000) score += 40;
    else if (rev >= 1500) score += 30;
    else if (rev >= 800) score += 20;
    else score += 10;

    if (contacted) score -= 20;

    const svc = (c.service || "").toLowerCase();
    if (svc.includes("spa")) score += 15;
    if (svc.includes("hair")) score += 5;

    score = Math.max(0, Math.min(100, score));

    const { offer, script } = buildRecommendation({
      name: c.name,
      service: c.service,
      revenue: rev,
      daysSinceLastVisit: days,
      contacted,
    });

    return {
      ...c,
      daysSinceLastVisit: days,
      contacted,
      revenue: rev,
      score,
      offer,
      script,
    };
  });

  const list = scored
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const totalPotential = list.reduce((s, c) => s + c.revenue, 0);

  const copyScript = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // ⭐ PDF DOWNLOAD FUNCTION (fully integrated)
  const downloadPDF = async () => {
    const res = await fetch("/api/call-sheet", {
      method: "POST",
      body: JSON.stringify({ customers: list }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "call-sheet.pdf";
    a.click();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24 }}>Smart Rebooking</h2>
      <p style={{ color: "#6b7280", marginBottom: 16 }}>
        Ranked customers with auto-generated offers & WhatsApp scripts.
      </p>

      {/* ⭐ DOWNLOAD PDF BUTTON */}
      <button
        onClick={downloadPDF}
        style={{
          padding: "8px 12px",
          marginBottom: 16,
          background: "#059669",
          color: "white",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        Download Call Sheet (PDF)
      </button>

      {/* Score filter */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8, color: "#4b5563" }}>
          Minimum score:
        </label>
        <select
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          style={{ padding: 6, borderRadius: 6 }}
        >
          <option value={20}>Show 20+</option>
          <option value={40}>Normal (40+)</option>
          <option value={60}>High (60+)</option>
          <option value={80}>Super VIP (80+)</option>
        </select>
      </div>

      <p style={{ marginBottom: 16 }}>
        Showing <b>{list.length}</b> customers • Potential Repeat Revenue:{" "}
        <b>₹{totalPotential.toLocaleString("en-IN")}</b>
      </p>

      {/* Table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={th}>Score</th>
              <th style={th}>Name</th>
              <th style={th}>Service</th>
              <th style={th}>Revenue</th>
              <th style={th}>Days Since</th>
              <th style={th}>Offer</th>
              <th style={th}>Script</th>
            </tr>
          </thead>

          <tbody>
            {list.map((c, i) => (
              <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={td}>
                  <ScoreBadge score={c.score} />
                </td>

                <td style={td}>
                  <a
                    href={`/customer/${encodeURIComponent(c.name)}`}
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                  >
                    {c.name}
                  </a>
                </td>

                <td style={td}>{c.service}</td>

                <td style={{ ...td, textAlign: "right" }}>
                  ₹{c.revenue.toLocaleString("en-IN")}
                </td>

                <td style={{ ...td, textAlign: "right" }}>
                  {c.daysSinceLastVisit}
                </td>

                <td style={td}>{c.offer}</td>

                <td style={{ ...td, maxWidth: 280 }}>
                  <div
                    style={{
                      padding: 8,
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      marginBottom: 4,
                    }}
                  >
                    <small>{c.script}</small>
                  </div>

                  <button
                    onClick={() => copyScript(c.script, i)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: copiedIndex === i ? "#16a34a" : "#2563eb",
                      color: "white",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {copiedIndex === i ? "Copied!" : "Copy Script"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Styling ---------- */

const th = {
  textAlign: "left",
  padding: "10px",
  color: "#6b7280",
  fontSize: 12,
};

const td = {
  padding: "10px",
  fontSize: 13,
  verticalAlign: "top",
  color: "#111827",
};

/* ---------- Score Badge ---------- */

function ScoreBadge({ score }) {
  let bg = "#d1d5db",
    text = "#111",
    label = "Low";

  if (score >= 80) (bg = "#f97316"), (text = "#fff"), (label = "🔥 Top");
  else if (score >= 60) (bg = "#3b82f6"), (text = "#fff"), (label = "High");
  else if (score >= 40) (bg = "#10b981"), (text = "#fff"), (label = "Medium");

  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: 999,
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 600,
        display: "inline-flex",
        gap: 6,
      }}
    >
      <span>{label}</span>
      <span>{score}</span>
    </div>
  );
}

/* -------- Recommendation Logic -------- */

function buildRecommendation({ name, service, revenue, daysSinceLastVisit }) {
  const svc = (service || "").toLowerCase();

  let offer =
    svc.includes("facial")
      ? "Glow-up facial – 10% off"
      : svc.includes("hair")
      ? "FREE hair spa add-on"
      : svc.includes("spa")
      ? "Relaxation spa combo"
      : "Loyalty discount";

  let script = `Hi ${name}, it's been ${
    daysSinceLastVisit ?? ""
  } days since your last ${service}. We're offering ${offer}. Can we book a slot for you?`;

  return { offer, script };
}
