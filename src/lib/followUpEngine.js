// returns follow-up date in 2 days
export function getFollowUpDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

// determines whether to show follow-up alert
export function needsFollowUp(customer, logs) {
  const entry = logs[customer.id];
  if (!entry) return true; // never contacted

  const last = new Date(entry.time);
  const now = new Date();

  // 48 hours difference
  const diff =
    (now.getTime() - last.getTime()) / (1000 * 60 * 60);

  return diff >= 48; // needs follow-up
}
