// Simple AI Rebooking Engine – Profit Optimized

const SERVICE_DEFAULTS = {
  Haircut: 30,
  "Hair Color": 60,
  Facial: 45,
  "Beard Grooming": 20,
  "Keratin Treatment": 120,
};

// Days between two dates
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Add days to a date string
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

// Score a single customer for rebooking
export function scoreCustomerForRebooking(customer, today = new Date()) {
  const freq =
    customer.avgFrequencyDays ||
    SERVICE_DEFAULTS[customer.serviceType] ||
    30;

  const expectedNextVisit = addDays(customer.lastVisit, freq);
  const daysUntilDue = daysBetween(today, expectedNextVisit);
  const daysOverdue = daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;

  // Core scoring components
  const overdueScore = Math.min(daysOverdue * 2, 50); // how overdue they are
  const loyaltyScore = Math.min((customer.totalVisits || 0) * 3, 25); // visits
  const valueScore = Math.min((customer.totalRevenue || 0) / 1000, 25); // money

  const rawScore = overdueScore + loyaltyScore + valueScore;
  const priorityScore = Math.min(Math.round(rawScore), 100);

  // Priority label
  let priorityLabel = "Warm";
  if (priorityScore >= 65) priorityLabel = "Hot";
  else if (priorityScore <= 35) priorityLabel = "Cold";

  // Overdue text & WhatsApp message
  const firstName = (customer.name || "").split(" ")[0] || customer.name;
  const overdueText =
    daysOverdue > 0
      ? daysOverdue + " days overdue"
      : "due soon";

  const suggestedMessage =
    "Hi " +
    firstName +
    ", it’s time to refresh your " +
    customer.serviceType +
    "! You are " +
    overdueText +
    ", and we have a perfect slot available today or tomorrow. " +
    "Shall I book it for you? 😊";

  return {
    ...customer,
    priorityScore,
    priorityLabel,
    overdueText,
    suggestedMessage,
  };
}

// Score and sort all customers
export function getRebookingRecommendations(customers, today = new Date()) {
  return customers
    .map((c) => scoreCustomerForRebooking(c, today))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
