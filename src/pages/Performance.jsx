import React, { useState, useContext } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../ThemeContext";

const Performance = () => {
  const [detectedCols, setDetectedCols] = useState(null);
  const [staffStats, setStaffStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const { darkMode } = useContext(ThemeContext);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      processData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Utility: pick a column by keyword match
  const pickColumn = (keys, keywords) => {
    const lowerKeys = keys.map((k) => k.toLowerCase());
    for (let i = 0; i < lowerKeys.length; i++) {
      const key = lowerKeys[i];
      if (keywords.some((kw) => key.includes(kw))) {
        return keys[i]; // return original key
      }
    }
    return null;
  };

  const isCompletedStatus = (value) => {
    if (!value) return false;
    const v = String(value).toLowerCase().trim();
    const completedTokens = [
      "completed",
      "done",
      "closed",
      "success",
      "successful",
      "booked",
      "converted",
      "yes",
      "attended",
      "visited",
      "confirmed",
    ];
    return completedTokens.some((t) => v.includes(t));
  };

  const processData = (data) => {
    if (!data || data.length === 0) return;

    const firstRow = data[0];
    const keys = Object.keys(firstRow || {});

    // Auto-detect columns
    const staffCol = pickColumn(keys, [
      "staff",
      "employee",
      "agent",
      "executive",
      "caller",
      "stylist",
      "therapist",
      "person",
      "owner",
      "user",
    ]);

    const statusCol = pickColumn(keys, [
      "status",
      "call status",
      "outcome",
      "result",
      "stage",
      "state",
    ]);

    const branchCol = pickColumn(keys, [
      "branch",
      "location",
      "salon",
      "store",
      "outlet",
    ]);

    const revenueCol = pickColumn(keys, [
      "revenue",
      "amount",
      "bill",
      "billing",
      "value",
      "total",
      "price",
      "sales",
    ]);

    const detected = {
      staffCol,
      statusCol,
      branchCol,
      revenueCol,
    };
    setDetectedCols(detected);

    let totalRecords = data.length;
    let completedCount = 0;

    const staffMap = {}; // staff -> { total, completed, revenue, branches: {} }

    data.forEach((row) => {
      const staffName = staffCol ? row[staffCol] || "Unknown" : "All Staff";
      const statusVal = statusCol ? row[statusCol] : null;
      const branchVal = branchCol ? row[branchCol] || "Unknown" : null;
      const revenueVal = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;

      const isCompleted = statusCol ? isCompletedStatus(statusVal) : false;
      if (isCompleted) completedCount++;

      if (!staffMap[staffName]) {
        staffMap[staffName] = {
          total: 0,
          completed: 0,
          revenue: 0,
          branches: {},
        };
      }

      staffMap[staffName].total += 1;
      if (isCompleted) staffMap[staffName].completed += 1;
      staffMap[staffName].revenue += revenueVal;

      if (branchCol) {
        if (!staffMap[staffName].branches[branchVal]) {
          staffMap[staffName].branches[branchVal] = {
            total: 0,
            completed: 0,
            revenue: 0,
          };
        }
        staffMap[staffName].branches[branchVal].total += 1;
        if (isCompleted)
          staffMap[staffName].branches[branchVal].completed += 1;
        staffMap[staffName].branches[branchVal].revenue += revenueVal;
      }
    });

    const pendingCount = totalRecords - completedCount;

    const staffArray = Object.entries(staffMap).map(([name, stats]) => {
      const conversionRate =
        stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      return {
        name,
        total: stats.total,
        completed: stats.completed,
        pending: stats.total - stats.completed,
        conversionRate: conversionRate.toFixed(1),
        revenue: stats.revenue,
        branches: stats.branches,
      };
    });

    // Sort staff by completed calls (descending)
    staffArray.sort((a, b) => b.completed - a.completed);

    setStaffStats(staffArray);
    setSummary({
      totalRecords,
      completedCount,
      pendingCount,
      completionRate:
        totalRecords > 0
          ? ((completedCount / totalRecords) * 100).toFixed(1)
          : 0,
    });
  };

  const downloadPDF = () => {
    if (!summary || staffStats.length === 0) return;

    const doc = new jsPDF("p", "mm", "a4");

    // Black header with gold text
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 220, 30, "F");
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(18);
    doc.text("Performance Report", 70, 20);

    try {
      doc.addImage("/mirrors_logo.png", "PNG", 150, 8, 40, 15);
    } catch (e) {
      console.error("Logo load error:", e);
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const generatedAt = new Date().toLocaleString();
    doc.text(`Generated: ${generatedAt}`, 14, 40);

    // Summary Section
    doc.setFontSize(12);
    doc.text("Summary Overview", 14, 55);
    doc.setFontSize(11);
    doc.text(`Total Records: ${summary.totalRecords}`, 14, 63);
    doc.text(`Completed: ${summary.completedCount}`, 14, 71);
    doc.text(`Pending: ${summary.pendingCount}`, 14, 79);
    doc.text(`Completion Rate: ${summary.completionRate}%`, 14, 87);

    // Staff Table
    const hasRevenue = !!(detectedCols && detectedCols.revenueCol);

    const head = hasRevenue
      ? [["Staff", "Total", "Completed", "Pending", "Conversion %", "Revenue"]]
      : [["Staff", "Total", "Completed", "Pending", "Conversion %"]];

    const body = staffStats.map((s) =>
      hasRevenue
        ? [
            s.name || "-",
            s.total,
            s.completed,
            s.pending,
            s.conversionRate,
            s.revenue.toFixed(0),
          ]
        : [s.name || "-", s.total, s.completed, s.pending, s.conversionRate]
    );

    autoTable(doc, {
      startY: 100,
      head,
      body,
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 215, 0] },
      bodyStyles: { textColor: [0, 0, 0] },
    });

    // Footer
    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 80, 290);

    doc.save("Performance_Report.pdf");
  };

  return (
    <div
      className={`p-6 min-h-screen transition-all ${
        darkMode ? "bg-[#111] text-yellow-300" : "bg-white text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Performance Report</h1>

      <div className="mb-4">
        <p className="text-sm mb-2 opacity-80">
          Upload any Excel file containing staff, status, revenue, or branch
          information. The system will auto-detect columns and build a
          performance summary.
        </p>
        <input
          type="file"
          onChange={handleFileUpload}
          className="p-2 border rounded bg-white text-black"
        />
      </div>

      {detectedCols && (
        <div className="mb-4 text-sm">
          <p className="font-semibold mb-1">Detected Columns:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Staff:{" "}
              <span className="font-mono">
                {detectedCols.staffCol || "Not found (using All Staff)"}
              </span>
            </li>
            <li>
              Status:{" "}
              <span className="font-mono">
                {detectedCols.statusCol || "Not found"}
              </span>
            </li>
            <li>
              Branch:{" "}
              <span className="font-mono">
                {detectedCols.branchCol || "Not found"}
              </span>
            </li>
            <li>
              Revenue:{" "}
              <span className="font-mono">
                {detectedCols.revenueCol || "Not found"}
              </span>
            </li>
          </ul>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-yellow-400"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <h2 className="font-semibold text-sm mb-1">Total Records</h2>
            <p className="text-2xl font-bold">{summary.totalRecords}</p>
          </div>
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-green-400"
                : "bg-green-100 border-green-300"
            }`}
          >
            <h2 className="font-semibold text-sm mb-1">Completed</h2>
            <p className="text-2xl font-bold">{summary.completedCount}</p>
          </div>
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-yellow-400"
                : "bg-yellow-100 border-yellow-300"
            }`}
          >
            <h2 className="font-semibold text-sm mb-1">Pending</h2>
            <p className="text-2xl font-bold">{summary.pendingCount}</p>
          </div>
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-blue-400"
                : "bg-blue-100 border-blue-300"
            }`}
          >
            <h2 className="font-semibold text-sm mb-1">Completion Rate</h2>
            <p className="text-2xl font-bold">
              {summary.completionRate}
              <span className="text-base ml-1">%</span>
            </p>
          </div>
        </div>
      )}

      {staffStats.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Staff Performance</h2>
          <div
            className={`overflow-x-auto rounded-xl border ${
              darkMode ? "border-yellow-400" : "border-gray-300"
            }`}
          >
            <table className="min-w-full text-sm">
              <thead className={darkMode ? "bg-[#1F1F1F]" : "bg-gray-100"}>
                <tr>
                  <th className="px-3 py-2 text-left">Staff</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Completed</th>
                  <th className="px-3 py-2 text-right">Pending</th>
                  <th className="px-3 py-2 text-right">Conversion %</th>
                  {detectedCols && detectedCols.revenueCol && (
                    <th className="px-3 py-2 text-right">Revenue</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {staffStats.map((s, idx) => (
                  <tr
                    key={idx}
                    className={
                      darkMode
                        ? idx % 2 === 0
                          ? "bg-[#111]"
                          : "bg-[#181818]"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                  >
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2 text-right">{s.total}</td>
                    <td className="px-3 py-2 text-right">{s.completed}</td>
                    <td className="px-3 py-2 text-right">{s.pending}</td>
                    <td className="px-3 py-2 text-right">
                      {s.conversionRate}%
                    </td>
                    {detectedCols && detectedCols.revenueCol && (
                      <td className="px-3 py-2 text-right">
                        {s.revenue.toFixed(0)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary && staffStats.length > 0 && (
        <button
          onClick={downloadPDF}
          className={`mt-4 px-6 py-3 rounded-xl font-bold shadow-lg ${
            darkMode
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Download Performance PDF
        </button>
      )}
    </div>
  );
};

export default Performance;
