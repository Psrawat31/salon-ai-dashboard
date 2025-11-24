// TOP OF FILE
import { useState, useEffect } from "react";
import axios from "axios";

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    const stored = sessionStorage.getItem("customers");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (customers !== null) return;

    async function fetchCustomers() {
      try {
        const res = await axios.get("/api/customers");
        setCustomers(res.data);
        sessionStorage.setItem("customers", JSON.stringify(res.data));
      } catch (err) {
        console.log("Fetch error:", err);
      }
    }

    fetchCustomers();
  }, []);

  return (
    <div>
      {customers ? (
        <div>Loaded {customers.length} customers</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
