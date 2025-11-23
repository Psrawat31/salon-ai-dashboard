export function getBestContactTime(customer) {
  // Simple rules for now, can upgrade later
  const hour = new Date().getHours();

  if (customer.serviceType.includes("Facial") || customer.serviceType.includes("Spa")) {
    return "2 PM – 6 PM";
  }

  if (customer.serviceType.includes("Keratin") || customer.serviceType.includes("Hair Color")) {
    return "11 AM – 2 PM";
  }

  if (customer.totalVisits > 5) {
    return "12 PM – 4 PM";
  }

  // fallback
  return "4 PM – 7 PM";
}
