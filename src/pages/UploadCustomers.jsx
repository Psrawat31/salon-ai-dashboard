import React from "react";
import * as XLSX from "xlsx";
import { useCustomerStore } from "../store/useCustomerStore";

export default function UploadCustomers() {
  const { customers, setCustomers } = useCustomerStore();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      // 🔥 Save temporarily so Daily Summary can read it on ANY page
      sessionStorage.setItem("customers", JSON.stringify(json));

      // 🔥 Update Zustand store too
      setCustomers(json);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Customers</h2>

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="mb-4 border px-3 py-2 rounded"
      />

      {customers.length === 0 ? (
        <p>No data uploaded yet.</p>
      ) : (
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">name</th>
              <th className="border px-3 py-2 text-left">lastVisit</th>
              <th className="border px-3 py-2 text-left">service</th>
              <th className="border px-3 py-2 text-left">revenue</th>
              <th className="border px-3 py-2 text-left">contacted</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, index) => (
              <tr key={index}>
                <td className="border px-3 py-2">{c.name}</td>
                <td className="border px-3 py-2">{c.lastVisit}</td>
                <td className="border px-3 py-2">{c.service}</td>
                <td className="border px-3 py-2">{c.revenue}</td>
                <td className="border px-3 py-2">
                  {c.contacted ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
