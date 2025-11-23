import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCustomerStore = create(
  persist(
    (set) => ({
      customers: [],
      setCustomers: (data) => set({ customers: data }),
      addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),
    }),
    {
      name: "customer-storage", // localStorage key
      getStorage: () => localStorage,
    }
  )
);

export default useCustomerStore;
