// client/src/components/Navbar.jsx (Elegant Version)
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavbarElegant() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => updateCart(), [location]);

  function updateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((s, p) => s + (p.qty || 1), 0));
    } catch {
      setCartCount(0);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-xl border-b border-purple-100/50 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo/logo.png"
            className="w-40 drop-shadow-sm hover:scale-105 transition-transform"
            alt="logo"
          />
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-10 font-light text-sm tracking-wide text-sv-purple">
          <Link to="/" className="hover:text-sv-orange">Home</Link>
          <Link to="/products" className="hover:text-sv-orange">Products</Link>
          <Link to="/contact" className="hover:text-sv-orange">Contact</Link>
          <Link to="/blog" className="hover:text-sv-orange">Blog</Link>

          <Link to="/cart" className="relative flex items-center">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs px-2 rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}
