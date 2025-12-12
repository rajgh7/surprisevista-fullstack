// client/src/pages/Products.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { strongCelebrate } from "../utils/confetti";
import { useSearchParams } from "react-router-dom";

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg p-4 shadow">
      <div className="bg-gray-200 h-44 rounded w-full"></div>
      <div className="mt-3 h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

function ProductCard({ p, onAdd }) {
  const src =
    p.image && p.image.startsWith("http")
      ? p.image
      : p.image
      ? p.image
      : "/placeholders/prod5.jpg";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-white shadow hover:shadow-xl overflow-hidden"
    >
      <img
        src={src}
        alt={p.name}
        className="w-full h-56 object-cover"
        onError={(e) => (e.target.src = "/placeholders/prod2.jpg")}
      />

      <div className="p-4">
        <h3 className="text-sv-purple font-semibold line-clamp-2">{p.name}</h3>
        <p className="text-gray-500 text-sm mb-2">{p.category}</p>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">₹{p.price}</p>
            {p.mrp > p.price && (
              <p className="text-xs line-through text-gray-400">₹{p.mrp}</p>
            )}
          </div>

          <button
            onClick={() => onAdd(p)}
            className="bg-sv-orange text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Products() {
  const allProducts = useRef([]);
  const [visible, setVisible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const batchSize = 12;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    setLoading(true);

    fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      }/api/products`
    )
      .then((r) => r.json())
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map((prod) => ({
              ...prod,
              id: prod._id || prod.id,
            }))
          : [];

        allProducts.current = normalized;
        applySearch(normalized);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (allProducts.current.length > 0) {
      applySearch(allProducts.current);
    }
  }, [searchQuery]);

  function applySearch(list) {
    let filtered = list;

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery)
      );
    }

    setVisible(filtered.slice(0, batchSize));
  }

  function addToCart(p) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const exists = cart.find((i) => i.id === p.id);
    if (exists) exists.qty += 1;
    else
      cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image || "/placeholders/product.png",
        qty: 1,
      });

    localStorage.setItem("cart", JSON.stringify(cart));

    strongCelebrate();
    setToast({ show: true, msg: "Added to cart 🎉" });
    setTimeout(() => setToast({ show: false, msg: "" }), 1500);

    window.dispatchEvent(new Event("storage"));
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-heading text-sv-purple mb-6">
          {searchQuery ? `Search results for "${searchQuery}"` : "Shop Gifts"}
        </h2>

        {/* GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : visible.map((p) => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
        </div>

        {/* LOAD MORE BUTTON */}
        {!searchQuery && visible.length > 0 && visible.length < allProducts.current.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const next = allProducts.current.slice(
                  visible.length,
                  visible.length + batchSize
                );
                setVisible((v) => [...v, ...next]);
              }}
              className="px-6 py-2 bg-sv-purple text-white rounded-lg shadow hover:bg-purple-700 transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-sv-purple text-white px-4 py-2 rounded shadow">
          {toast.msg}
        </div>
      )}
    </section>
  );
}
