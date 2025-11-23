import React from "react";
import Sidebar from "./components/Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px 40px",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
