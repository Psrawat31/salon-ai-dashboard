// src/Layout.jsx
import React from "react";
import Sidebar from "./components/Sidebar";

export default function Layout({ children, darkMode }) {
  const bg = darkMode ? "#0b0f1a" : "#ffffff";
  const text = darkMode ? "#ffffff" : "#0b0f1a";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: bg,
        color: text,
      }}
    >
      <Sidebar darkMode={darkMode} />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
