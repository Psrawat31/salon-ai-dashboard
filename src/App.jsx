import React from "react";

const App = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r p-4">
        <h2 className="font-bold text-lg mb-4">AI Dashboard</h2>

        <nav className="flex flex-col gap-2">
          <a href="/" className="hover:bg-gray-200 p-2 rounded">Dashboard</a>
          <a href="/upload-customers" className="hover:bg-gray-200 p-2 rounded">Upload Customers</a>
          <a href="/daily-summary" className="hover:bg-gray-200 p-2 rounded">Daily Summary</a>
          <a href="/ai-reminders" className="hover:bg-gray-200 p-2 rounded">AI Reminders</a>
          <a href="/performance" className="hover:bg-gray-200 p-2 rounded">Performance</a>
          <a href="/service-analytics" className="hover:bg-gray-200 p-2 rounded">Service Analytics</a>
        </nav>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default App;
