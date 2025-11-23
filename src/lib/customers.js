// Load customers from localStorage OR fallback to default list

let stored = [];

try {
  stored = JSON.parse(localStorage.getItem("customers")) || [];
} catch {
  stored = [];
}

// Convert Excel data format → internal format
export const customers = stored.length
  ? stored.map((c, i) => ({
      id: i + 1,
      name: c.Name,
      phone: c.Phone.toString(),
      serviceType: c.Service,
      lastVisit: c.LastVisit,
      daysOverdue: computeDaysOverdue(c.LastVisit),
      totalRevenue: Number(c.Revenue) || 0,
    }))
  : [
      // DEFAULT SAMPLE CUSTOMERS
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
  const last = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  return diff;
}
