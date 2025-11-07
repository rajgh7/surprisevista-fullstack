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

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const removeAt = (i) => {
    const c = [...cart];
    c.splice(i, 1);
    setCart(c);
    localStorage.setItem("cart", JSON.stringify(c));
  };

  const total = cart.reduce((s, p) => s + (p.price * (p.qty || 1)), 0);

  async function handleOrder(e) {
    e.preventDefault();
    if (!customer.name || !customer.email || !customer.address) {
      setError("Please fill all required fields.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          items: cart,
          total,
        }),
      });

      if (!res.ok) throw new Error("Failed to place order");
      const data = await res.json();

      localStorage.removeItem("cart");
      navigate("/thank-you", { state: { order: data } });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
              className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <img
                src={p.image.startsWith("http") ? p.image : `${import.meta.env.BASE_URL}${p.image.replace(/^\//, "")}`}
                alt={p.name}
                className="w-24 h-24 object-cover rounded-lg border"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-semibold text-sv-purple">{p.name}</h3>
                <p className="text-sv-orange font-medium">₹{p.price}</p>
              </div>
              <button
                onClick={() => removeAt(i)}
                className="text-sm border border-gray-300 rounded px-4 py-2 hover:bg-gray-100 transition"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="text-right font-semibold text-xl text-sv-purple mt-4">
            Total: ₹{total.toLocaleString("en-IN")}
          </div>

          {/* Customer Form */}
          <form
            onSubmit={handleOrder}
            className="bg-pink-50/50 p-6 rounded-lg mt-8 space-y-4 shadow-inner"
          >
            <h3 className="text-xl font-heading text-sv-purple mb-2">
              Enter Delivery Details
            </h3>
            <input
              required
              placeholder="Full Name"
              className="w-full border rounded p-2"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              required
              placeholder="Email Address"
              type="email"
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
              className={`btn btn-primary w-full mt-3 ${
                placing ? "opacity-70" : ""
              }`}
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
