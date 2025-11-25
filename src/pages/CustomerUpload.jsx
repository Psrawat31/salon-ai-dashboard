import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

export default function CustomerUpload() {
  const [rows, setRows] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Parse as OBJECTS, not arrays
      const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      console.log("Parsed JSON:", parsed);

      // Normalize columns
      const normalized = parsed.map((row) => ({
        name: row.name || row.Name || "",
        lastVisit: row.lastVisit || row.lastvisit || row["last visit"] || "",
        service: row.service || row.Service || "",
        revenue: Number(row.revenue || row.Revenue || 0),
        contacted: row.contacted || row.Contacted || "No",
      }));

      console.log("Normalized:", normalized);

      setRows(normalized);

      // Save to sessionStorage
      sessionStorage.setItem("customers", JSON.stringify(normalized));

      // 🔥 SEND TO BACKEND (KV)
      try {
        const res = await axios.post("/api/customers", {
          customers: normalized,
        });
        console.log("KV Save Response:", res.data);

        alert("Customer data uploaded successfully!");
      } catch (err) {
        console.error("KV Upload Error:", err);
        alert("Upload failed. Check console.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Customers</h1>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="border p-2 rounded"
      />

      <div className="mt-6">
        {rows.length > 0 ? (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Last Visit</th>
                <th className="border p-2">Service</th>
                <th className="border p-2">Revenue</th>
                <th className="border p-2">Contacted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2">{row.name}</td>
                  <td className="border p-2">{row.lastVisit}</td>
                  <td className="border p-2">{row.service}</td>
                  <td className="border p-2">{row.revenue}</td>
                  <td className="border p-2">{row.contacted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No data uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
