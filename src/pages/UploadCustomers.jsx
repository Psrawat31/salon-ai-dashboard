import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function UploadCustomers({ setCustomers }) {
  const [tableData, setTableData] = useState([]);

  // Restore last session data (optional)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("customers");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTableData(parsed);
        setCustomers(parsed);
      }
    } catch (err) {
      console.error("Failed to restore customers", err);
    }
  }, [setCustomers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log("Parsed Excel Data:", parsedData);

      // Show in table
      setTableData(parsedData);
      setCustomers(parsedData);

      // Save locally for fast reload
      sessionStorage.setItem("customers", JSON.stringify(parsedData));

      // ⭐ No backend call, clean and simple
      alert("Customers uploaded and stored locally.");
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Upload Customers</h2>

      <input type="file" onChange={handleFileUpload} className="mb-4" />

      {tableData.length > 0 && (
        <div className="overflow-auto max-h-[70vh] border rounded p-2 bg-white">
          <table className="min-w-full border">
            <thead>
              <tr>
                {Object.keys(tableData[0]).map((col) => (
                  <th key={col} className="border px-3 py-2 font-semibold bg-gray-100">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-3 py-1">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
