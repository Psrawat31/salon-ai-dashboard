import React, { useState, useContext } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../ThemeContext";

const CustomerProfile = () => {
  const [rows, setRows] = useState([]);
  const [detectedCols, setDetectedCols] = useState(null);
  const [customerStats, setCustomerStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const { darkMode } = useContext(ThemeContext);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const wb = XLSX.read(event.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      setRows(json);
      process(json);
    };

    reader.readAsBinaryString(file);
  };

  const pickColumn = (keys, keywords) => {
    const lower = keys.map((k) => k.toLowerCase());
    for (let i = 0; i < lower.length; i++) {
      if (keywords.some((kw) => lower[i].includes(kw))) return keys[i];
    }
    return null;
  };

  const process = (data) => {
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]);

    const nameCol = pickColumn(keys, ["name", "customer", "client"]);
    const visitCol = pickColumn(keys, ["visit", "last"]);
    const serviceCol = pickColumn(keys, ["service", "treatment"]);
    const revenueCol = pickColumn(keys, ["revenue", "amount"]);
    const contactCol = pickColumn(keys, ["contact", "contacted"]);

    const detected = {
      nameCol,
      visitCol,
      serviceCol,
      revenueCol,
      contactCol,
    };
    setDetectedCols(detected);

    const map = {};

    data.forEach((row) => {
      const name = nameCol ? row[nameCol] || "Unknown" : "Unknown";
      const revenue = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;
      const contacted = contactCol ? String(row[contactCol]).toLowerCase() : "";
      const service = serviceCol ? row[serviceCol] : "-";
      const visit = visitCol ? row[visitCol] : "-";

      if (!map[name]) {
        map[name] = {
          visits: 0,
          totalRevenue: 0,
          lastVisit: visit,
          services: new Set(),
          contacted: 0,
          notContacted: 0,
        };
      }

      map[name].visits += 1;
      map[name].totalRevenue += revenue;
      if (service) map[name].services.add(service);
      map[name].lastVisit = visit;

      if (contactCol) {
        if (contacted.includes("yes") || contacted.includes("done"))
          map[name].contacted++;
        else map[name].notContacted++;
      }
    });

    const stats = Object.entries(map).map(([name, s]) => ({
      name,
      visits: s.visits,
      lastVisit: s.lastVisit,
      totalRevenue: s.totalRevenue,
      services: Array.from(s.services).join(", "),
      contacted: s.contacted,
      notContacted: s.notContacted,
    }));

    stats.sort((a, b) => b.totalRevenue - a.totalRevenue);

    setCustomerStats(stats);

    setSummary({
      totalCustomers: stats.length,
      totalRevenue: stats.reduce((a, b) => a + b.totalRevenue, 0),
      avgRevenue:
        stats.length > 0
          ? (stats.reduce((a, b) => a + b.totalRevenue, 0) / stats.length).toFixed(0)
          : 0,
      repeatCustomers: stats.filter((c) => c.visits > 1).length,
    });
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF("p", "mm");

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 220, 30, "F");
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(18);
    doc.text("Customer Profile Report", 60, 20);

    try {
      doc.addImage("/mirrors_logo.png", "PNG", 150, 8, 40, 15);
    } catch {}

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    doc.text(`Total Customers: ${summary.totalCustomers}`, 14, 50);
    doc.text(`Total Revenue: ₹${summary.totalRevenue}`, 14, 58);
    doc.text(`Avg Revenue per Customer: ₹${summary.avgRevenue}`, 14, 66);
    doc.text(`Repeat Customers: ${summary.repeatCustomers}`, 14, 74);

    const head = [
      [
        "Name",
        "Visits",
        "Last Visit",
        "Total Revenue",
        "Services",
        detectedCols?.contactCol ? "Contacted" : "",
      ].filter(Boolean),
    ];

    const body = customerStats.map((c) =>
      [
        c.name,
        c.visits,
        c.lastVisit,
        `₹${c.totalRevenue}`,
        c.services,
        detectedCols?.contactCol ? c.contacted : null,
      ].filter(Boolean)
    );

    autoTable(doc, {
      startY: 90,
      head,
      body,
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 215, 0] },
      bodyStyles: { textColor: [0, 0, 0] },
    });

    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 80, 290);

    doc.save("Customer_Profile_Report.pdf");
  };

  return (
    <div
      className={`p-6 min-h-screen transition-all ${
        darkMode ? "bg-[#111] text-yellow-300" : "bg-white text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Customer Profiles</h1>

      <input
        type="file"
        onChange={handleUpload}
        className="mb-6 p-2 border rounded bg-white text-black"
      />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-blue-400"
                : "bg-blue-100 border-blue-300"
            }`}
          >
            <h2 className="text-sm font-semibold mb-1">Total Customers</h2>
            <p className="text-2xl font-bold">{summary.totalCustomers}</p>
          </div>

          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-green-400"
                : "bg-green-100 border-green-300"
            }`}
          >
            <h2 className="text-sm font-semibold mb-1">Total Revenue</h2>
            <p className="text-2xl font-bold">₹{summary.totalRevenue}</p>
          </div>

          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-purple-400"
                : "bg-purple-100 border-purple-300"
            }`}
          >
            <h2 className="text-sm font-semibold mb-1">Repeat Customers</h2>
            <p className="text-2xl font-bold">{summary.repeatCustomers}</p>
          </div>
        </div>
      )}

      {summary && (
        <button
          onClick={downloadPDF}
          className={`mt-6 px-6 py-3 rounded-xl font-bold shadow-lg ${
            darkMode
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Download Customer Profile PDF
        </button>
      )}
    </div>
  );
};

export default CustomerProfile;
