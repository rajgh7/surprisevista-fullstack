// client/src/components/Navbar.jsx (Minimal Version)
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => updateCart(), [location]);

  function updateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let total = cart.reduce((sum, p) => sum + (p.qty || 1), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo/logo.png"
            alt="logo"
            className="w-36 hover:opacity-90 transition"
          />
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex gap-8 text-sm">
          <Link to="/" className="hover:text-sv-purple">Home</Link>
          <Link to="/products" className="hover:text-sv-purple">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple">Blog</Link>

          <Link to="/cart" className="relative">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}
