import React, { useEffect, useState, useRef } from "react";
import { getAssetPath } from "../utils/getAssetPath";

// Toast Notification
function Toast({ msg, show }) {
  return (
    <div
      className={`toast bg-sv-purple ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {msg}
    </div>
  );
}

// Product Card
function ProductCard({ p, onAdd, onQuickView }) {
  return (
    <article className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden animate-fadeIn">
      <img
        src={getAssetPath(p.image)}
        alt={p.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-sm font-medium text-sv-purple">{p.name}</h3>
        <p className="text-xs text-gray-500">{p.category}</p>

        <div className="mt-3 flex justify-between items-center">
          <div className="text-lg font-semibold">₹{p.price}</div>

          <div className="flex gap-2">
            <button
              onClick={() => onQuickView(p)}
              className="text-xs border px-3 py-1 rounded bg-pink-50"
            >
              Quick view
            </button>
            <button
              onClick={() => onAdd(p)}
              className="text-xs bg-sv-orange text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ===============================
      MAIN PRODUCTS PAGE
=============================== */

export default function Products() {
  const allProducts = useRef([]);
  const [visible, setVisible] = useState([]);
  const [nextIndex, setNextIndex] = useState(0);
  const [batchSize] = useState(12);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [quickProduct, setQuickProduct] = useState(null);

  useEffect(() => {
    fetch("https://surprisevista-backend.onrender.com/api/products")
      .then((r) => r.json())
      .then((data) => {
        // Normalize each product to always include `id`
        const normalized = Array.isArray(data)
          ? data.map((prod) => ({
              ...prod,
              id: prod.id || prod._id || (typeof prod === "object" && prod._id ? prod._id : undefined),
            }))
          : [];

        allProducts.current = normalized;
        setVisible(allProducts.current.slice(0, batchSize));
        setNextIndex(batchSize);
      })
      .catch(() => {
        allProducts.current = [];
      });
  }, [batchSize]);

  function addToCart(p) {
    // Make a safe shallow copy and ensure `id` exists
    const productToAdd = { ...p, id: p.id || p._id };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]").map((it) => ({
      ...it,
      id: it.id || it._id, // normalize any old entries
    }));

    const exists = cart.find((c) => c.id === productToAdd.id);

    if (exists) {
      exists.qty = (exists.qty || 1) + 1;
    } else {
      cart.push({
        id: productToAdd.id,
        name: productToAdd.name,
        price: productToAdd.price,
        image: productToAdd.image,
        qty: 1,
        // keep extra fields only if you want (avoid _id duplication)
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showToast("Added to cart");
  }

  function showToast(msg) {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg: "", show: false }), 1800);
  }

  return (
    <div className="min-h-screen bg-pink-50/30 py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((p) => (
          <ProductCard
            key={p.id || p._id}
            p={p}
            onAdd={addToCart}
            onQuickView={setQuickProduct}
          />
        ))}
      </div>

      <Toast show={toast.show} msg={toast.msg} />
    </div>
  );
}
