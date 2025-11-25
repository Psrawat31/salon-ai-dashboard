import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

export default function UploadCustomers({ setCustomers }) {
  const [tableData, setTableData] = useState([]);

  // Restore last session data (optional)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("customers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTableData(parsed);
          if (typeof setCustomers === "function") {
            setCustomers(parsed);
          }
        }
      }
    } catch (err) {
      console.error("Failed to restore customers", err);
    }
  }, [setCustomers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      let parsedData = [];

      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(sheet);

        // 🛡️ SAFETY: Ensure ALWAYS an array
        if (!Array.isArray(parsedData)) parsedData = [];

        // 🛡️ SAFETY: Remove non-object rows
        parsedData = parsedData.filter((row) => typeof row === "object");
      } catch (err) {
        console.error("Excel parse error:", err);
        parsedData = [];
      }

      setTableData(parsedData);

      if (typeof setCustomers === "function") {
        try {
          setCustomers(parsedData);
        } catch (err) {
          console.error("setCustomers is not a function", err);
        }
      }

      sessionStorage.setItem("customers", JSON.stringify(parsedData));

      // Optional backend sync
      try {
        await axios.post("/api/customers", { customers: parsedData });
      } catch (err) {
        console.warn("KV backend optional sync failed:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Customers</h2>

      <input type="file" onChange={handleFileUpload} />

      {(tableData || []).length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              {Object.keys(tableData[0] || {}).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(tableData || []).map((row, index) => (
              <tr key={index}>
                {Object.values(row || {}).map((val, i) => (
                  <td key={i}>{String(val ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
