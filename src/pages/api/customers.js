import { getAllCustomers, saveAllCustomers } from "../../../lib/kv";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const customers = await getAllCustomers();
      return res.status(200).json(customers);
    } catch (err) {
      console.error("GET /api/customers error:", err);
      return res.status(500).json({ error: "Failed to load customers" });
    }
  }

  if (req.method === "POST") {
    try {
      const { customers } = req.body;

      if (!Array.isArray(customers)) {
        return res.status(400).json({ error: "Invalid input format" });
      }

      const normalized = customers.map((c) => ({
        name: c.name ?? "",
        lastVisit: c.lastVisit ?? "",
        service: c.service ?? "",
        revenue: Number(c.revenue ?? 0),
        contacted: c.contacted ?? "No",
      }));

      await saveAllCustomers(normalized);

      return res.status(200).json({ success: true, count: normalized.length });
    } catch (err) {
      console.error("POST /api/customers error:", err);
      return res.status(500).json({ error: "Failed to save customers" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
