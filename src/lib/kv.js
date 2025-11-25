import { kv } from "@vercel/kv";

const CUSTOMERS_KEY = "customers";

export async function getAllCustomers() {
  const data = await kv.get(CUSTOMERS_KEY);
  return data || [];
}

export async function saveAllCustomers(customers) {
  if (!Array.isArray(customers)) {
    throw new Error("customers must be an array");
  }
  await kv.set(CUSTOMERS_KEY, customers);
}
