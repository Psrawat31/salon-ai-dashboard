import React, { useState } from "react";

const CustomerUpload = () => {
  const [data, setData] = useState([]);

  // Load SheetJS from CDN dynamically
  const loadSheetJS = async () => {
    if (!window.XLSX) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }
    return window.XLSX;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const XLSX = await loadSheetJS();

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("Parsed:", json);

      setData(json);
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
        {data.length > 0 ? (
          <table className="min-w-full border">
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {row.map((col, j) => (
                    <td key={j} className="border p-2">
                      {col}
                    </td>
                  ))}
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
};

export default CustomerUpload;
