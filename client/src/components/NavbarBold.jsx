// client/src/components/Navbar.jsx (Bold Version)
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavbarBold() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => updateCart(), [location]);

  function updateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, p) => s + (p.qty || 1), 0));
    } catch {}
  }

  return (
    <nav className="fixed top-0 w-full bg-white shadow-lg z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* BIG LOGO WRAPPER */}
        <Link to="/" className="flex items-center gap-4">
          <div className="p-3 bg-sv-orange/10 rounded-2xl shadow-md border border-sv-orange/20 hover:scale-105 transition">
            <img
              src="/logo/logo.png"
              className="w-48 drop-shadow hover:drop-shadow-lg transition"
              alt="logo"
            />
          </div>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-10 text-base font-semibold">
          <Link to="/" className="hover:text-sv-purple">Home</Link>
          <Link to="/products" className="hover:text-sv-purple">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple">Blog</Link>

          <Link to="/cart" className="relative text-xl">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}
