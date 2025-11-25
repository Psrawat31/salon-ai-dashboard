import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Performance = () => {
  const [excelData, setExcelData] = useState([]);
  const [detectedCols, setDetectedCols] = useState(null);
  const [staffStats, setStaffStats] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let parsedData = [];

      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(sheet);

        // 🛡️ Always ensure array
        if (!Array.isArray(parsedData)) parsedData = [];

        // 🛡️ Remove invalid rows
        parsedData = parsedData.filter((row) => typeof row === "object");
      } catch (err) {
        console.error("Excel parsing failed:", err);
        parsedData = [];
      }

      setExcelData(parsedData);
      processData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Utility: detect column based on keyword
  const pickColumn = (keys, keywords) => {
    if (!Array.isArray(keys)) return null;
    const lower = keys.map((k) => k.toLowerCase());
    for (let i = 0; i < lower.length; i++) {
      if (keywords.some((kw) => lower[i].includes(kw))) return keys[i];
    }
    return null;
  };

  // Utility: completed status detector
  const isCompletedStatus = (value) => {
    if (!value) return false;
    const v = String(value).toLowerCase();
    const completedTokens = [
      "completed",
      "done",
      "closed",
      "success",
      "booked",
      "converted",
      "yes",
      "visited",
      "confirmed",
    ];
    return completedTokens.some((t) => v.includes(t));
  };

  const processData = (data = []) => {
    if (!Array.isArray(data) || data.length === 0) return;

    const firstRow = data[0] || {};
    const keys = Object.keys(firstRow || {});

    const staffCol = pickColumn(keys, [
      "staff",
      "employee",
      "executive",
      "agent",
      "stylist",
      "person",
    ]);
    const statusCol = pickColumn(keys, ["status", "outcome", "result"]);
    const branchCol = pickColumn(keys, ["branch", "location", "outlet"]);
    const revenueCol = pickColumn(keys, ["revenue", "amount", "bill", "value"]);

    const detected = { staffCol, statusCol, branchCol, revenueCol };
    setDetectedCols(detected);

    let totalRecords = data.length;
    let completedCount = 0;

    const staffMap = {};

    data.forEach((row) => {
      if (typeof row !== "object") return;

      const staffName = staffCol ? row[staffCol] || "Unknown" : "Staff";
      const statusVal = statusCol ? row[statusCol] : null;
      const branchVal = branchCol ? row[branchCol] || "Unknown" : null;
      const revenueVal = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;

      const isCompleted = isCompletedStatus(statusVal);
      if (isCompleted) completedCount++;

      if (!staffMap[staffName]) {
        staffMap[staffName] = {
          total: 0,
          completed: 0,
          pending: 0,
          revenue: 0,
          branches: {},
        };
      }

      staffMap[staffName].total++;
      if (isCompleted) staffMap[staffName].completed++;
      staffMap[staffName].pending = staffMap[staffName].total - staffMap[staffName].completed;
      staffMap[staffName].revenue += revenueVal;

      if (branchCol) {
        if (!staffMap[staffName].branches[branchVal]) {
          staffMap[staffName].branches[branchVal] = {
            total: 0,
            completed: 0,
            revenue: 0,
          };
        }
        staffMap[staffName].branches[branchVal].total++;
        if (isCompleted) staffMap[staffName].branches[branchVal].completed++;
        staffMap[staffName].branches[branchVal].revenue += revenueVal;
      }
    });

    const staffArray = Object.entries(staffMap).map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      conversionRate: ((stats.completed / stats.total) * 100).toFixed(1),
      revenue: stats.revenue,
      branches: stats.branches,
    }));

    staffArray.sort((a, b) => b.completed - a.completed);

    setStaffStats(staffArray);

    setSummary({
      totalRecords,
      completedCount,
      pendingCount: totalRecords - completedCount,
      completionRate: ((completedCount / totalRecords) * 100).toFixed(1),
    });
  };

  const downloadPDF = () => {
    if (!summary || !Array.isArray(staffStats)) return;

    const doc = new jsPDF("p", "mm");

    try {
      doc.addImage("/mirrors_logo.png", "PNG", 80, 8, 50, 20);
    } catch {}

    doc.setFontSize(18);
    doc.text("Performance Report", 65, 38);

    doc.setFontSize(12);
    doc.text(`Total Records: ${summary.totalRecords}`, 14, 60);
    doc.text(`Completed: ${summary.completedCount}`, 14, 68);
    doc.text(`Pending: ${summary.pendingCount}`, 14, 76);
    doc.text(`Completion Rate: ${summary.completionRate}%`, 14, 84);

    const hasRevenue = detectedCols?.revenueCol;

    const head = hasRevenue
      ? [["Staff", "Total", "Completed", "Pending", "Conversion %", "Revenue"]]
      : [["Staff", "Total", "Completed", "Pending", "Conversion %"]];

    const body = (staffStats || []).map((s) =>
      hasRevenue
        ? [
            s.name,
            s.total,
            s.completed,
            s.pending,
            s.conversionRate,
            s.revenue.toFixed(0),
          ]
        : [s.name, s.total, s.completed, s.pending, s.conversionRate]
    );

    autoTable(doc, { startY: 100, head, body });

    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 80, 290);

    doc.save("Performance_Report.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Performance Report</h1>

      <input type="file" onChange={handleFileUpload} />

      {summary && (
        <button
          onClick={downloadPDF}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Download Performance PDF
        </button>
      )}
    </div>
  );
};

export default Performance;
