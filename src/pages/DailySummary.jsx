import React, { useState, useContext } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../ThemeContext"; 

const DailySummary = () => {
  const [excelData, setExcelData] = useState([]);
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

      setExcelData(parsedData);
      generateSummary(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const generateSummary = (data) => {
    if (!data || data.length === 0) return;

    const totalCalls = data.length;
    const completedCalls = data.filter(
      (row) => row.Status?.toLowerCase() === "completed"
    ).length;

    const pendingCalls = totalCalls - completedCalls;

    const staffStats = {};
    data.forEach((row) => {
      if (!staffStats[row.Staff]) {
        staffStats[row.Staff] = { total: 0, completed: 0 };
      }
      staffStats[row.Staff].total++;
      if (row.Status?.toLowerCase() === "completed")
        staffStats[row.Staff].completed++;
    });

    setSummary({
      totalCalls,
      completedCalls,
      pendingCalls,
      staffStats,
    });
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 220, 30, "F");

    doc.setTextColor(255, 215, 0);
    doc.setFontSize(18);
    doc.text("Daily Summary Report", 70, 20);

    // Logo
    doc.addImage("/mirrors_logo.png", "PNG", 150, 8, 40, 15);

    // Body section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    doc.text(`Total Calls: ${summary.totalCalls}`, 14, 45);
    doc.text(`Completed Calls: ${summary.completedCalls}`, 14, 55);
    doc.text(`Pending Calls: ${summary.pendingCalls}`, 14, 65);

    // Staff table
    const staffTable = Object.entries(summary.staffStats).map(
      ([staff, stats]) => ({
        Staff: staff,
        Total: stats.total,
        Completed: stats.completed,
      })
    );

    autoTable(doc, {
      startY: 80,
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 215, 0] },
      bodyStyles: { textColor: [0, 0, 0] },
      head: [["Staff", "Total Calls", "Completed Calls"]],
      body: staffTable.map((row) => [row.Staff, row.Total, row.Completed]),
    });

    doc.setFontSize(10);
    doc.text("Powered by Salon AI", 14, 290);

    doc.save("Daily_Summary_Report.pdf");
  };

  return (
    <div
      className={`p-6 min-h-screen transition-all ${
        darkMode ? "bg-[#111] text-yellow-300" : "bg-white text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Daily Summary</h1>

      <input
        type="file"
        onChange={handleFileUpload}
        className="mb-6 p-2 border rounded bg-white text-black"
      />

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TOTAL CALLS */}
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-yellow-400"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <h2 className="font-bold text-lg">Total Calls</h2>
            <p className="text-4xl font-extrabold">{summary.totalCalls}</p>
          </div>

          {/* COMPLETED */}
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-green-400"
                : "bg-green-100 border-green-300"
            }`}
          >
            <h2 className="font-bold text-lg">Completed</h2>
            <p className="text-4xl font-extrabold">
              {summary.completedCalls}
            </p>
          </div>

          {/* PENDING */}
          <div
            className={`p-4 rounded-xl shadow-lg border ${
              darkMode
                ? "bg-[#1A1A1A] border-red-400"
                : "bg-red-100 border-red-300"
            }`}
          >
            <h2 className="font-bold text-lg">Pending</h2>
            <p className="text-4xl font-extrabold">{summary.pendingCalls}</p>
          </div>
        </div>
      )}

      {summary && (
        <button
          onClick={downloadPDF}
          className={`mt-8 px-6 py-3 rounded-xl font-bold shadow-lg ${
            darkMode
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Download Daily Summary PDF
        </button>
      )}
    </div>
  );
};

export default DailySummary;
