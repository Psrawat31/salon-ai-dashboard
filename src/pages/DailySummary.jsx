import React from "react";
import { useCustomerStore } from "../store/useCustomerStore";
import { generateSummary } from "../lib/summaryEngine";

export default function DailySummary() {
  const { customers, loadFromSession } = useCustomerStore();

  React.useEffect(() => {
    if (!customers || customers.length === 0) {
      loadFromSession();
    }
  }, []);

  const summary = generateSummary(customers || []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Daily AI Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="border p-4 rounded">
          <div>HOT CUSTOMERS TODAY</div>
          <div className="text-2xl font-bold">{summary.hotCustomers}</div>
        </div>

        <div className="border p-4 rounded">
          <div>CONTACTED TODAY</div>
          <div className="text-2xl font-bold">{summary.contactedToday}</div>
        </div>

        <div className="border p-4 rounded">
          <div>STILL TO CONTACT</div>
          <div className="text-2xl font-bold">{summary.stillToContact}</div>
        </div>

        <div className="border p-4 rounded">
          <div>POTENTIAL REPEAT REVENUE</div>
          <div className="text-2xl font-bold">₹{summary.potentialRevenue}</div>
        </div>

        <div className="border p-4 rounded">
          <div>CONTACTED REVENUE</div>
          <div className="text-2xl font-bold">₹{summary.contactedRevenue}</div>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">Follow-up Priority List</h3>

      {summary.hotList.length === 0 ? (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          No high-priority follow-ups.
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2">Customer</th>
              <th className="border px-3 py-2">Last Visit</th>
              <th className="border px-3 py-2">Service</th>
              <th className="border px-3 py-2">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {summary.hotList.map((c, i) => (
              <tr key={i}>
                <td className="border px-3 py-2">{c.name}</td>
                <td className="border px-3 py-2">{c.lastVisit}</td>
                <td className="border px-3 py-2">{c.service}</td>
                <td className="border px-3 py-2">{c.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
