// Load customers safely (Vercel SSR has no localStorage)
let stored = [];

try {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("customers");
    stored = data ? JSON.parse(data) : [];
  } else {
    stored = [];
  }
} catch {
  stored = [];
}

// SAFE GUARD: If stored is not an array → reset to empty
if (!Array.isArray(stored)) {
  stored = [];
}

// Convert Excel data format → internal format
export const customers = stored.length
  ? stored.map((c, i) => ({
      id: i + 1,
      name: c.Name || "",
      phone: c.Phone ? c.Phone.toString() : "",
      serviceType: c.Service || "",
      lastVisit: c.LastVisit || "",
      daysOverdue: computeDaysOverdue(c.LastVisit),
      totalRevenue: Number(c.Revenue) || 0,
    }))
  : [
      {
        id: 1,
        name: "Sample Customer",
        phone: "9999999999",
        serviceType: "Haircut",
        lastVisit: "2024-12-01",
        daysOverdue: 20,
        totalRevenue: 500,
      },
    ];

function computeDaysOverdue(dateStr) {
  if (!dateStr) return 0;

  const last = new Date(dateStr);
  if (isNaN(last)) return 0;

  const now = new Date();
  const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  return diff;
}
