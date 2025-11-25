import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper: always returns array
const safeArray = (v) => (Array.isArray(v) ? v : []);

// Helper: always returns object
const safeObject = (v) => (v && typeof v === "object" ? v : {});

const CustomerProfile = () => {
  const [rows, setRows] = useState([]);
  const [detectedCols, setDetectedCols] = useState(null);
  const [customerStats, setCustomerStats] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let wb = XLSX.read(event.target.result, { type: "binary" });
      let sheet = wb.Sheets[wb.SheetNames[0]];

      let json = safeArray(XLSX.utils.sheet_to_json(sheet));

      setRows(json);
      process(json);
    };

    reader.readAsBinaryString(file);
  };

  const pickColumn = (keys = [], keywords = []) => {
    if (!Array.isArray(keys)) return null;

    const lower = keys.map((k) => k.toLowerCase());
    for (let i = 0; i < lower.length; i++) {
      if (keywords.some((kw) => lower[i].includes(kw))) return keys[i];
    }
    return null;
  };

  const process = (data) => {
    data = safeArray(data);
    if (data.length === 0) return;

    const first = safeObject(data[0]);
    const keys = Object.keys(first);

    const nameCol = pickColumn(keys, ["name", "customer", "client"]);
    const visitCol = pickColumn(keys, ["visit", "last"]);
    const serviceCol = pickColumn(keys, ["service", "treatment"]);
    const revenueCol = pickColumn(keys, ["revenue", "amount"]);
    const contactCol = pickColumn(keys, ["contact", "contacted"]);

    const detected = { nameCol, visitCol, serviceCol, revenueCol, contactCol };
    setDetectedCols(detected);

    const map = {};

    safeArray(data).forEach((rowRaw) => {
      const row = safeObject(rowRaw);

      const name = row[nameCol] || "Unknown";
      const revenue = parseFloat(row[revenueCol]) || 0;
      const service = row[serviceCol] || "-";
      const visit = row[visitCol] || "-";

      const contacted = String(row[contactCol] || "").toLowerCase();

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
      map[name].lastVisit = visit;

      if (service !== "-") map[name].services.add(service);

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
          ? (
              stats.reduce((a, b) => a + b.totalRevenue, 0) / stats.length
            ).toFixed(0)
          : 0,
      repeatCustomers: stats.filter((c) => c.visits > 1).length,
    });
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF("p", "mm");

    try {
      doc.addImage("/mirrors_logo.png", "PNG", 80, 8, 50, 20);
    } catch {}

    doc.setFontSize(18);
    doc.text("Customer Profile Report", 65, 38);

    doc.setFontSize(11);
    doc.text(`Total Customers: ${summary.totalCustomers}`, 14, 60);
    doc.text(`Total Revenue: ₹${summary.totalRevenue}`, 14, 68);
    doc.text(`Avg Revenue: ₹${summary.avgRevenue}`, 14, 76);
    doc.text(`Repeat Customers: ${summary.repeatCustomers}`, 14, 84);

    const head = [
      [
        "Name",
        "Visits",
        "Last Visit",
        "Total Revenue",
        "Services",
        detectedCols?.contactCol ? "Contacted" : null,
      ].filter(Boolean),
    ];

    const body = safeArray(customerStats).map((c) =>
      [
        c.name,
        c.visits,
        c.lastVisit,
        `₹${c.totalRevenue}`,
        c.services,
        detectedCols?.contactCol ? c.contacted : null,
      ].filter(Boolean)
    );

    autoTable(doc, { startY: 100, head, body });

    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 80, 290);

    doc.save("Customer_Profile_Report.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Profiles</h1>

      <input type="file" onChange={handleUpload} className="mb-4" />

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded shadow">
            <h2 className="text-sm font-semibold mb-1">Total Customers</h2>
            <p className="text-2xl font-bold">{summary.totalCustomers}</p>
          </div>
          <div className="p-4 bg-green-100 rounded shadow">
            <h2 className="text-sm font-semibold mb-1">Total Revenue</h2>
            <p className="text-2xl font-bold">₹{summary.totalRevenue}</p>
          </div>
          <div className="p-4 bg-purple-100 rounded shadow">
            <h2 className="text-sm font-semibold mb-1">Repeat Customers</h2>
            <p className="text-2xl font-bold">{summary.repeatCustomers}</p>
          </div>
        </div>
      )}

      {summary && (
        <button
          onClick={downloadPDF}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Download Customer Profile PDF
        </button>
      )}
    </div>
  );
};

export default CustomerProfile;
