import React, { useEffect, useState, useRef } from "react";
import { getAssetPath } from "../utils/getAssetPath"; // adjust relative path if needed

/* ===========================
   🔸 Helper components
=========================== */

// Toast Notification
function Toast({ msg, show }) {
  return (
    <div
      className={`toast bg-sv-purple ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="status"
    >
      {msg}
    </div>
  );
}

// Product Card
function ProductCard({ p, onAdd, onQuickView }) {
  return (
    <article className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden animate-fadeIn">
      <div className="relative">
        <img
          src={getAssetPath(p.image)}
          alt={p.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-sv-purple">{p.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{p.category}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-semibold">₹{p.price}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickView(p)}
              className="text-xs px-3 py-1 border rounded bg-pink-50 text-sv-purple hover:bg-pink-100 transition"
            >
              Quick view
            </button>
            <button
              onClick={() => onAdd(p)}
              className="text-xs bg-sv-orange text-white px-3 py-1 rounded hover:scale-105 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Fancy QuickView Modal with 360° animation + gallery
function QuickView({ product, onClose, onAdd }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!product) return null;

  const images = product.gallery?.length ? product.gallery : [product.image];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-sv-orange text-lg"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image & Gallery */}
          <div className="flex flex-col items-center justify-center">
            <img
  src={getAssetPath(images[activeIndex])}
  alt={product.name}
  className="rounded-lg object-cover w-full h-64 animate-360"
  onError={(e) => (e.target.src = getAssetPath("placeholder.jpg"))}
/>
            <div className="flex justify-center gap-2 mt-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`gallery-dot ${idx === activeIndex ? "active" : ""}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-2xl font-heading text-sv-purple">
              {product.name}
            </h3>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="text-lg font-semibold text-sv-orange mt-4">
              ₹{product.price}
            </div>

            <button
              onClick={() => {
                onAdd(product);
                onClose();
              }}
              className="btn btn-primary mt-4"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   🔸 Main Products Page
=========================== */

export default function Products() {
  const allProducts = useRef([]);
  const [visible, setVisible] = useState([]);
  const [batchSize] = useState(12);
  const [nextIndex, setNextIndex] = useState(0);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [quickProduct, setQuickProduct] = useState(null);

  /* -------------------------
     Fetch real products from backend
     with fallback to generated data
  --------------------------*/
  useEffect(() => {
    fetch("https://surprisevista-backend.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          allProducts.current = data;
          resetAndLoad();
        } else {
          allProducts.current = generateProducts();
          resetAndLoad();
        }
      })
      .catch(() => {
        allProducts.current = generateProducts();
        resetAndLoad();
      });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible, nextIndex]);

  useEffect(() => {
    resetAndLoad();
    // eslint-disable-next-line
  }, [category, sort]);

  // Generate 150 demo products if API not available
  function generateProducts() {
    const categories = ["Party", "Corporate", "Retail"];
    const imgs = ["/party1.jpg", "/party2.jpg", "/party3.jpg", "/hero.jpg"];
    const arr = [];
    for (let i = 1; i <= 150; i++) {
      const cat = categories[i % categories.length];
      arr.push({
        id: `P-${i}`,
        name: `${cat} Gift Item ${i}`,
        category: cat,
        price: Math.round(150 + (i * 7) % 2000),
        image: imgs[i % imgs.length],
        gallery: imgs,
        description: `Beautiful ${cat.toLowerCase()} gift — personalized, premium packaging.`,
      });
    }
    return arr;
  }

  // Filtering & Sorting
  function getFilteredSortedList() {
    let list = allProducts.current.slice();
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }

  function resetAndLoad() {
    const list = getFilteredSortedList();
    setVisible(list.slice(0, batchSize));
    setNextIndex(batchSize);
  }

  function loadMore() {
    const list = getFilteredSortedList();
    if (nextIndex >= list.length) return;
    const next = list.slice(nextIndex, nextIndex + batchSize);
    setVisible((prev) => [...prev, ...next]);
    setNextIndex(nextIndex + next.length);
  }

  function handleScroll() {
    const nearBottom =
      window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 700;
    if (nearBottom) loadMore();
  }

  // Cart Logic
  function addToCart(p) {
    const cart = JSON.parse(localStorage.getItem("sv_cart") || "[]");
    const exists = cart.find((c) => c.id === p.id);
    if (exists) exists.qty += 1;
    else cart.push({ ...p, qty: 1 });
    localStorage.setItem("sv_cart", JSON.stringify(cart));
    showToast("Added to cart");
  }

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2000);
  }

  /* -------------------------
     JSX Rendering
  --------------------------*/
  return (
    <div className="min-h-screen bg-pink-50/30 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading text-sv-purple">
              Shop Gifts
            </h1>
            <p className="text-gray-600 text-sm">
              Curated collections for Party, Corporate and Retail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Categories */}
            <div className="hidden md:flex bg-white rounded-lg shadow px-3 py-2">
              {["All", "Party", "Corporate", "Retail"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded ${
                    category === c
                      ? "bg-pink-50 text-sv-purple"
                      : "text-gray-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white"
            >
              <option value="default">Sort: Default</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </header>

        {/* Product Grid */}
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                onAdd={addToCart}
                onQuickView={setQuickProduct}
              />
            ))}
          </div>

          {/* Load Info */}
          <div className="mt-8 text-center text-gray-500">
            {nextIndex < getFilteredSortedList().length
              ? "Scroll to load more..."
              : "No more products."}
          </div>
        </main>
      </div>

      <Toast msg={toast.msg} show={toast.show} />
      <QuickView
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        onAdd={addToCart}
      />
    </div>
  );
}
