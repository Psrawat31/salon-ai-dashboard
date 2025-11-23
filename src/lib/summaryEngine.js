// NEW SUMMARY ENGINE FIXED FOR EXCEL UPLOAD DATA

export function generateSummary(customers) {
  if (!customers || customers.length === 0) {
    return {
      hotCustomers: 0,
      contactedToday: 0,
      stillToContact: 0,
      potentialRevenue: 0,
      contactedRevenue: 0,
      hotList: []
    };
  }

  const today = new Date();

  // customers coming from Excel look like:
  // { name, lastVisit, service, revenue, contacted }

  const hotList = customers.filter((c) => {
    if (!c.lastVisit) return false;
    const last = new Date(c.lastVisit);
    const diff = (today - last) / (1000 * 60 * 60 * 24);
    return diff > 30; // overdue
  });

  const contactedToday = customers.filter((c) => c.contacted === true);
  const stillToContact = customers.filter((c) => !c.contacted);

  const potentialRevenue = hotList.reduce(
    (sum, c) => sum + (Number(c.revenue) || 0),
    0
  );

  const contactedRevenue = contactedToday.reduce(
    (sum, c) => sum + (Number(c.revenue) || 0),
    0
  );

  return {
    hotCustomers: hotList.length,
    contactedToday: contactedToday.length,
    stillToContact: stillToContact.length,
    potentialRevenue,
    contactedRevenue,
    hotList
  };
}

// helper: load from sessionStorage if Zustand is empty
export function loadCustomersFromSession() {
  const stored = sessionStorage.getItem("customers");
  if (!stored) return [];
  return JSON.parse(stored);
}
