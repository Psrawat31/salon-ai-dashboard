// Simple contact log using localStorage

const STORAGE_KEY = "salon_ai_contact_log";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage || null;
  } catch (e) {
    return null;
  }
}

function loadLog() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLog(log) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch (e) {
    // ignore
  }
}

// Add a new contact entry
export function logContactForCustomer(customerId, channel) {
  const log = loadLog();
  log.push({
    customerId,
    channel,
    timestamp: new Date().toISOString(),
  });
  saveLog(log);
}

// Get last contact entry for a customer
export function getLastContactForCustomer(customerId) {
  const log = loadLog();
  const entries = log.filter((e) => e.customerId === customerId);
  if (!entries.length) return null;

  // latest by timestamp
  return entries.reduce((latest, entry) =>
    latest.timestamp > entry.timestamp ? latest : entry
  );
}
