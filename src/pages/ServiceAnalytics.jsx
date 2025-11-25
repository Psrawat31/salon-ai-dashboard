import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ServiceAnalytics = () => {
  const [data, setData] = useState([]);
  const [detectedCols, setDetectedCols] = useState(null);
  const [serviceStats, setServiceStats] = useState([]);
  const [summary, setSummary] = useState(null);

  const safeArray = (v) => (Array.isArray(v) ? v : []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let wb = XLSX.read(event.target.result, { type: "binary" });
      let sheet = wb.Sheets[wb.SheetNames[0]];
      let json = safeArray(XLSX.utils.sheet_to_json(sheet));

      setData(json);
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

  const process = (rows) => {
    rows = safeArray(rows);
    if (rows.length === 0) return;

    const keys = Object.keys(rows[0] || {});

    const serviceCol = pickColumn(keys, ["service", "treatment", "category"]);
    const revenueCol = pickColumn(keys, ["revenue", "amount", "bill", "value"]);
    const contactCol = pickColumn(keys, ["contact", "contacted", "status"]);

    setDetectedCols({ serviceCol, revenueCol, contactCol });

    const serviceMap = {};

    rows.forEach((row = {}) => {
      const service = row[serviceCol] || "Unknown";
      const revenue = parseFloat(row[revenueCol]) || 0;
      const contacted = String(row[contactCol] || "").toLowerCase();

      if (!serviceMap[service]) {
        serviceMap[service] = {
          count: 0,
          revenue: 0,
          contacted: 0,
          notContacted: 0,
        };
      }

      serviceMap[service].count++;
      serviceMap[service].revenue += revenue;

      if (contactCol) {
        if (contacted.includes("yes") || contacted.includes("done"))
          serviceMap[service].contacted++;
        else serviceMap[service].notContacted++;
      }
    });

    const stats = Object.entries(serviceMap).map(([service, s]) => ({
      service,
      count: s.count,
      revenue: s.revenue,
      contacted: s.contacted,
      notContacted: s.notContacted,
    }));

    stats.sort((a, b) => b.revenue - a.revenue);

    setServiceStats(stats);

    setSummary({
      totalServices: stats.reduce((a, b) => a + b.count, 0),
      totalRevenue: stats.reduce((a, b) => a + b.revenue, 0),
      topService: stats[0]?.service || "-",
      topRevenue: stats[0]?.revenue || 0,
    });
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();
    try {
      doc.addImage("/mirrors_logo.png", "PNG", 80, 8, 50, 20);
    } catch {}

    doc.setFontSize(18);
    doc.text("Service Analytics Report", 65, 38);

    doc.setFontSize(11);
    doc.text(`Total Services: ${summary.totalServices}`, 14, 60);
    doc.text(`Total Revenue: ₹${summary.totalRevenue}`, 14, 68);
    doc.text(`Top Service: ${summary.topService}`, 14, 76);

    const head = [
      [
        "Service",
        "Count",
        "Revenue",
        detectedCols?.contactCol ? "Contacted" : null,
        detectedCols?.contactCol ? "Not Contacted" : null,
      ].filter(Boolean),
    ];

    const body = serviceStats.map((s) =>
      [
        s.service,
        s.count,
        s.revenue,
        detectedCols?.contactCol ? s.contacted : null,
        detectedCols?.contactCol ? s.notContacted : null,
      ].filter(Boolean)
    );

    autoTable(doc, { startY: 100, head, body });
    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 80, 290);
    doc.save("Service_Analytics_Report.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Analytics</h1>

      <input type="file" onChange={handleUpload} className="mb-4" />

      {summary && (
        <button
          onClick={downloadPDF}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Download Service Analytics PDF
        </button>
      )}
    </div>
  );
};

export default ServiceAnalytics;
