import { create } from "zustand";

export const useCustomerStore = create((set) => ({
  customers: [],
  setCustomers: (data) => set({ customers: data }),
}));
