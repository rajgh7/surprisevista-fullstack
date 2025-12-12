// client/src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { strongCelebrate } from "../utils/confetti";

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

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  function saveCart(updated) {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  function updateQty(id, type) {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, qty: Math.max(1, item.qty + (type === "+" ? 1 : -1)) }
        : item
    );
    saveCart(updated);
  }

  function removeItem(id) {
    saveCart(cart.filter((item) => item.id !== id));
  }

  const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
  const delivery = subtotal > 0 ? 59 : 0;
  const total = subtotal + delivery;

  async function placeOrder(e) {
    e.preventDefault();

    if (!customer.name || !customer.email || !customer.address) {
      return setError("Please fill all required fields.");
    }

    if (!cart.length) {
      return setError("Your cart is empty.");
    }

    setPlacing(true);

    try {
      const cleanItems = cart.map((c) => ({
        id: c.id,
        name: c.name,
        qty: c.qty,
        price: c.price,
        image: c.image,
      }));

      const orderCode = "SV-" + Date.now();

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cleanItems,
          total,
          paymentMethod: "COD",
          orderCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      strongCelebrate();

      localStorage.removeItem("cart");
      navigate("/thank-you", { state: { order: data } });
    } catch (err) {
      console.error(err);
      setError("Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-heading text-sv-purple mb-6">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <img
            src="/placeholders/product.png"
            className="w-32 h-32 mx-auto opacity-50"
          />
          <p className="mt-4 text-gray-600">
            Your cart is empty. <a href="/products" className="text-sv-purple underline">Shop now</a>
          </p>
        </div>
      ) : (
        <>

          {/* CART ITEMS */}
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || "/placeholders/product.png"}
                  className="w-28 h-28 rounded object-cover"
                  onError={(e) => (e.target.src = "/placeholders/product.png")}
                />

                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sv-orange font-bold">₹{item.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded">
                  <button onClick={() => updateQty(item.id, "-")} className="px-3 py-1">-</button>
                  <span className="px-4">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, "+")} className="px-3 py-1">+</button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* TOTALS SECTION */}
          <div className="text-right text-xl font-semibold mt-6">
            <p>Subtotal: ₹{subtotal}</p>
            <p>Delivery: ₹{delivery}</p>
            <p>Total: ₹{total}</p>
          </div>

          {/* CUSTOMER FORM */}
          <form onSubmit={placeOrder} className="bg-pink-50 p-6 mt-10 rounded-lg space-y-3">
            <input
              required
              placeholder="Full Name"
              className="w-full p-2 border rounded"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
            <input
              placeholder="Phone Number"
              className="w-full p-2 border rounded"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
            <textarea
              required
              placeholder="Full Address"
              rows="3"
              className="w-full p-2 border rounded"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
              disabled={placing}
              className="w-full py-3 rounded bg-sv-orange text-white font-medium hover:bg-orange-600"
            >
              {placing ? "Placing Order…" : "Cash on Delivery"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
