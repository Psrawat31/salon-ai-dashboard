// TOP OF FILE
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Customers() {
  // 1️⃣ CORE DATA STATE (customers list)
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  // 2️⃣ UI STATE (needed for persistence)
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 3️⃣ FETCH CUSTOMERS (only if not stored)
  useEffect(() => {
    if (customers !== null) return;

    async function fetchCustomers() {
      try {
        const res = await axios.get("/api/customers");
        setCustomers(res.data);
        sessionStorage.setItem("customers", JSON.stringify(res.data));
      } catch (err) {
        console.log("Fetch error:", err);
      }
    }

    fetchCustomers();
  }, []);

  // 4️⃣ LOAD UI STATE ON PAGE OPEN
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem("customersPageState");
      if (!savedState) return;

      const parsed = JSON.parse(savedState);

      if (parsed.searchText !== undefined) setSearchText(parsed.searchText);
      if (parsed.selectedStatus !== undefined) setSelectedStatus(parsed.selectedStatus);
      if (parsed.currentPage !== undefined) setCurrentPage(parsed.currentPage);
      if (parsed.rowsPerPage !== undefined) setRowsPerPage(parsed.rowsPerPage);

    } catch (err) {
      console.log("Load UI state error:", err);
    }
  }, []);

  // 5️⃣ SAVE UI STATE ON ANY CHANGE
  useEffect(() => {
    try {
      const stateToSave = {
        searchText,
        selectedStatus,
        currentPage,
        rowsPerPage,
      };

      sessionStorage.setItem("customersPageState", JSON.stringify(stateToSave));
    } catch (err) {
      console.log("Save UI state error:", err);
    }
  }, [searchText, selectedStatus, currentPage, rowsPerPage]);

  // 6️⃣ SIMPLE DISPLAY (you can replace this with your real table later)
  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers Page</h2>

      {/* Example Controls — replace with your real UI */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ padding: "6px", marginRight: "10px" }}
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ padding: "6px", marginRight: "10px" }}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          style={{ padding: "6px" }}
        >
          <option value={5}>5 rows</option>
          <option value={10}>10 rows</option>
          <option value={20}>20 rows</option>
        </select>
      </div>

      {/* Display */}
      {customers ? (
        <div>
          <div>Loaded {customers.length} customers</div>

          <div style={{ marginTop: "10px" }}>
            <strong>Current Page:</strong> {currentPage}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
