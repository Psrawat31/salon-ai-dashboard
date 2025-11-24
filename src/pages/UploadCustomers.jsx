import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function UploadCustomers({ setCustomers }) {
  const [tableData, setTableData] = useState([]);

  // 🔥 On load, restore last saved customers from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("customers");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTableData(parsed);
        setCustomers(parsed);
      }
    } catch (err) {
      console.error("Failed to restore customers from localStorage", err);
    }
  }, [setCustomers]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log("Parsed:", parsedData);

      // Show in table
      setTableData(parsedData);

      // 🔥 Update global state
      setCustomers(parsedData);

      // 🔥 Persist for Vercel reloads
      try {
        window.localStorage.setItem("customers", JSON.stringify(parsedData));
      } catch (err) {
        console.error("Failed to save customers to localStorage", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Upload Customers</h2>

      <input type="file" onChange={handleFileUpload} />

      {tableData.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
