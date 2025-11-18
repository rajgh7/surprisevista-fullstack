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

  const API_BASE = "https://surprisevista-backend.onrender.com";
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  function saveCart(newCart) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function updateQty(id, type) {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, qty: item.qty + (type === "+" ? 1 : -1) }
        : item
    );
    saveCart(updated.filter((i) => i.qty > 0));
  }

  function removeItem(id) {
    saveCart(cart.filter((item) => item.id !== id));
  }

  const subtotal = cart.reduce(
    (sum, p) => sum + p.price * (p.qty || 1),
    0
  );
  const delivery = subtotal > 0 ? 59 : 0;
  const total = subtotal + delivery;

  function generateOrderCode() {
    const d = new Date();
    const r = Math.floor(10000 + Math.random() * 90000);
    return `SV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate()
    ).padStart(2, "0")}-${r}`;
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!customer.name || !customer.email || !customer.address) {
      setError("All required fields must be filled.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty!");
      return;
    }

    setPlacing(true);

    try {
      const cleanItems = cart.map(({ _id, ...rest }) => rest);
      const orderCode = generateOrderCode();

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

      localStorage.removeItem("cart");
      navigate("/thank-you", { state: { order: data } });
    } catch (err) {
      setError("Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-heading text-sv-purple mb-6">Your Cart</h2>

      {cart.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center mb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  className="w-20 h-20 rounded object-cover"
                />
                <div>
                  <h3>{item.name}</h3>
                  <p className="text-sv-orange">₹{item.price}</p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, "-")}
                      className="border px-3 py-1"
                    >
                      -
                    </button>
                    <span className="border px-3 py-1 bg-gray-50">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, "+")}
                      className="border px-3 py-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-sm border px-4 py-2"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="text-right text-xl font-semibold mt-6">
            <p>Subtotal: ₹{subtotal}</p>
            <p>Delivery: ₹{delivery}</p>
            <p>Total: ₹{total}</p>
          </div>

          <form
            onSubmit={placeOrder}
            className="bg-pink-50 p-6 mt-8 rounded-lg space-y-3"
          >
            <input
              className="w-full border p-2 rounded"
              placeholder="Full Name"
              required
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Email"
              type="email"
              required
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Phone Number"
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Full Address"
              required
              rows="3"
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />

            {error && <p className="text-red-600">{error}</p>}

            <button
              disabled={placing}
              className="bg-sv-orange text-white w-full py-3 rounded"
            >
              {placing ? "Placing Order…" : "Cash on Delivery"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
