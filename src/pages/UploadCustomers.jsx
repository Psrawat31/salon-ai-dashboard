import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadCustomers() {
  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      setTableData(Array.isArray(parsedData) ? parsedData : []);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Upload Customers</h2>

      <input type="file" onChange={handleFileUpload} className="mb-4" />

      {Array.isArray(tableData) && tableData.length > 0 && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(Array.isArray(tableData) ? tableData : []).map((row, index) => (
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

