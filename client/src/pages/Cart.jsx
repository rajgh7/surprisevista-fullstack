import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE = "https://surprisevista-backend.onrender.com";

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const saveCart = (c) => {
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  };

  const incQty = (i) => {
    const updated = [...cart];
    updated[i].qty = (updated[i].qty || 1) + 1;
    saveCart(updated);
  };

  const decQty = (i) => {
    const updated = [...cart];
    if ((updated[i].qty || 1) > 1) {
      updated[i].qty -= 1;
      saveCart(updated);
    }
  };

  const removeAt = (i) => {
    saveCart(cart.filter((_, idx) => idx !== i));
  };

  const subtotal = cart.reduce(
    (sum, p) => sum + p.price * (p.qty || 1),
    0
  );

  const delivery = subtotal > 0 ? 59 : 0;
  const grandTotal = subtotal + delivery;

  // ORDER CODE
  function generateOrderCode() {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}`;
    const random = Math.floor(10000 + Math.random() * 90000);
    return `SV-${date}-${random}`;
  }

  // PLACE COD ORDER
  async function handleCOD(e) {
    e.preventDefault();

    if (!customer.name || !customer.email || !customer.address) {
      setError("Please fill all required fields.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty!");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const cleanItems = cart.map(({ _id, ...rest }) => rest);
      const orderCode = generateOrderCode();

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cleanItems,
          total: grandTotal,
          paymentMethod: "COD",
          orderCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      localStorage.removeItem("cart");

      navigate("/thank-you", { state: { order: data } });

    } catch (err) {
      console.error("Order error:", err);
      setError("❌ Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-heading text-sv-purple mb-6">Your Cart 🛒</h2>

      {cart.length === 0 ? (
        <p className="text-gray-600">No items in your cart yet.</p>
      ) : (
        <div className="space-y-6">
          {cart.map((p, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    p.image.startsWith("http")
                      ? p.image
                      : `${import.meta.env.BASE_URL}${p.image.replace(
                          /^\//,
                          ""
                        )}`
                  }
                  className="w-24 h-24 object-cover rounded-lg border"
                />

                <div>
                  <h3 className="font-semibold text-sv-purple">{p.name}</h3>
                  <p className="text-sv-orange font-medium">₹{p.price}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => decQty(i)} className="px-3 py-1 border rounded">-</button>
                    <span className="px-3 py-1 border rounded bg-gray-50">
                      {p.qty || 1}
                    </span>
                    <button onClick={() => incQty(i)} className="px-3 py-1 border rounded">+</button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeAt(i)}
                className="text-sm border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Totals */}
          <div className="text-right font-semibold text-xl text-sv-purple space-y-1">
            <div>Subtotal: ₹{subtotal}</div>
            <div>Delivery: ₹{delivery}</div>
            <div className="border-t pt-2 text-2xl">Grand Total: ₹{grandTotal}</div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCOD}
            className="bg-pink-50/50 p-6 rounded-lg mt-8 space-y-4 shadow-inner"
          >
            <h3 className="text-xl font-heading text-sv-purple mb-2">Delivery Details</h3>

            <input
              required
              placeholder="Full Name"
              className="w-full border rounded p-2"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />

            <input
              required
              type="email"
              placeholder="Email Address"
              className="w-full border rounded p-2"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />

            <input
              placeholder="Phone Number"
              className="w-full border rounded p-2"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />

            <textarea
              required
              placeholder="Full Address"
              className="w-full border rounded p-2"
              rows="3"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              disabled={placing}
              className="w-full bg-sv-orange text-white py-3 rounded"
            >
              {placing ? "Placing Order…" : "Cash on Delivery"}
            </button>

            {/* FUTURE RAZORPAY — Disabled */}
            {/* <button
              className="w-full bg-green-600 text-white py-3 rounded opacity-40 cursor-not-allowed"
            >
              Online Payment Coming Soon
            </button> */}
          </form>
        </div>
      )}
    </section>
  );
}
