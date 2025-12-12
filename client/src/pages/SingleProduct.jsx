// client/src/pages/SingleProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { strongCelebrate } from "../utils/confetti";

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        // fetch all and filter related (client-side fallback)
        const allRes = await fetch(`${API_BASE}/api/products`);
        const all = await allRes.json();
        if (Array.isArray(all) && data?.category) {
          const relatedList = all
            .filter((p) => p._id !== data._id && p.category === data.category)
            .slice(0, 6);
          setRelated(relatedList);
        } else {
          setRelated(all.slice(0, 6));
        }
      } catch (err) {
        console.error("Product load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.find((c) => c.id === (product.id || product._id));
    if (exists) exists.qty = (exists.qty || 1) + qty;
    else
      cart.push({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image || "/placeholders/product.png",
        qty,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    strongCelebrate();
    window.dispatchEvent(new Event("storage"));
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded" />
          <div className="h-6 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="mt-3 text-gray-600">The product may have been removed.</p>
        <Link to="/products" className="mt-6 inline-block bg-sv-purple text-white px-4 py-2 rounded">
          Back to products
        </Link>
      </div>
    );
  }

  const gallery = product.images && product.images.length ? product.images : [product.image || "/placeholders/product.png"];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Gallery / thumbnails */}
        <div>
          <div className="rounded-xl overflow-hidden border bg-white shadow">
            <img
              src={gallery[0]}
              alt={product.name}
              className="w-full h-[460px] object-cover"
              onError={(e) => (e.target.src = "/placeholders/product.png")}
            />
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto">
            {gallery.map((g, i) => (
              <img
                key={i}
                src={g}
                alt={`${product.name} ${i}`}
                className="w-28 h-20 object-cover rounded cursor-pointer border"
                onClick={(e) => {
                  // swap main image by setting src on parent - simplest approach
                  const main = e.target.closest(".max-w-6xl").querySelector("img");
                  if (main) main.src = g;
                }}
                onError={(e) => (e.target.src = "/placeholders/product.png")}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-sv-purple">{product.name}</h1>
          <p className="text-gray-600">{product.shortDescription || product.description || ""}</p>

          <div className="flex items-center gap-6 mt-3">
            <div>
              <div className="text-3xl font-extrabold">₹{product.price}</div>
              {product.mrp > product.price && <div className="text-sm line-through text-gray-400">₹{product.mrp}</div>}
            </div>

            <div className="bg-green-50 text-green-700 px-3 py-1 rounded">In stock</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1">-</button>
              <div className="px-4">{qty}</div>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-1">+</button>
            </div>

            <button onClick={addToCart} className="px-4 py-2 bg-sv-orange text-white rounded shadow">
              Add to cart
            </button>

            <button onClick={() => { addToCart(); navigate("/cart"); }} className="px-4 py-2 border rounded">
              Buy now
            </button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Product details</h4>
            <p className="text-gray-700 text-sm" style={{ whiteSpace: "pre-wrap" }}>
              {product.description || "No description provided."}
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">You may also like</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link key={r._id} to={`/product/${r._id}`} className="bg-white rounded p-2 shadow-sm flex flex-col items-start gap-2">
                  <img src={r.image || "/placeholders/product.png"} className="w-full h-24 object-cover rounded" onError={(e) => (e.target.src = "/placeholders/product.png")} />
                  <div className="text-xs font-medium">{r.name}</div>
                  <div className="text-sv-orange font-bold text-sm">₹{r.price}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
