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
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet);

      const safe = Array.isArray(parsed) ? parsed : [];
      setExcelData(safe);
      processData(safe);
    };

    reader.readAsArrayBuffer(file);
  };

  const pickColumn = (keys, keywords) => {
    const lower = keys.map((k) => k.toLowerCase());
    for (let i = 0; i < lower.length; i++) {
      if (keywords.some((kw) => lower[i].includes(kw))) return keys[i];
    }
    return null;
  };

  const isCompletedStatus = (value) => {
    if (!value) return false;
    const v = value.toString().toLowerCase();
    return ["completed", "done", "yes", "booked", "success"].some((w) =>
      v.includes(w)
    );
  };

  const processData = (data) => {
    if (!Array.isArray(data) || data.length === 0) return;

    const keys = Object.keys(data[0]);
    const staffCol = pickColumn(keys, ["staff", "executive", "caller"]);
    const statusCol = pickColumn(keys, ["status", "result"]);
    const revenueCol = pickColumn(keys, ["revenue", "amount"]);

    setDetectedCols({ staffCol, statusCol, revenueCol });

    let completed = 0;
    const map = {};

    data.forEach((row) => {
      const staff = staffCol ? row[staffCol] || "Unknown" : "Unknown";
      const revenue = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;
      const completedFlag = statusCol && isCompletedStatus(row[statusCol]);

      if (!map[staff]) map[staff] = { total: 0, completed: 0, revenue: 0 };

      map[staff].total++;
      if (completedFlag) {
        map[staff].completed++;
        completed++;
      }

      map[staff].revenue += revenue;
    });

    const arr = Object.entries(map).map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      pending: stats.total - stats.completed,
      revenue: stats.revenue,
      conversionRate: ((stats.completed / stats.total) * 100).toFixed(1),
    }));

    setStaffStats(arr);
    setSummary({
      totalRecords: data.length,
      completedCount: completed,
      pendingCount: data.length - completed,
      completionRate: ((completed / data.length) * 100).toFixed(1),
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Performance Report</h1>
      <input type="file" onChange={handleFileUpload} />

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-200">Total: {summary.totalRecords}</div>
          <div className="p-4 bg-green-200">Completed: {summary.completedCount}</div>
          <div className="p-4 bg-yellow-200">Pending: {summary.pendingCount}</div>
          <div className="p-4 bg-blue-200">{summary.completionRate}%</div>
        </div>
      )}

      {Array.isArray(staffStats) && staffStats.length > 0 && (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Staff</th>
              <th>Total</th>
              <th>Completed</th>
              <th>Pending</th>
              <th>Conversion %</th>
              {detectedCols?.revenueCol && <th>Revenue</th>}
            </tr>
          </thead>

          <tbody>
            {(Array.isArray(staffStats) ? staffStats : []).map((s, idx) => (
              <tr key={idx}>
                <td>{s.name}</td>
                <td>{s.total}</td>
                <td>{s.completed}</td>
                <td>{s.pending}</td>
                <td>{s.conversionRate}</td>
                {detectedCols?.revenueCol && <td>{s.revenue.toFixed(0)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Performance;
