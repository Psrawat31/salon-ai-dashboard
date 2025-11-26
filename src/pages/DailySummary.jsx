import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function DailySummary() {
  const [excelData, setExcelData] = useState([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("uploadedData");
    if (saved) {
      setExcelData(JSON.parse(saved));
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      sessionStorage.setItem("uploadedData", JSON.stringify(json));
      setExcelData(json);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Daily Summary</h1>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="border p-2 mb-4"
      />

      {excelData.length === 0 ? (
        <p className="text-gray-600">Upload an Excel file to view summary.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {Object.keys(excelData[0]).map((header) => (
                <th key={header} className="border p-2 bg-gray-100">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {excelData.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((value, j) => (
                  <td key={j} className="border p-2">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
