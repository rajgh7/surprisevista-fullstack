// client/src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    updateCartCount();
  }, [location]);

  useEffect(() => {
    const listener = () => updateCartCount();
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let total = 0;
      cart.forEach((item) => (total += item.qty || 1));
      if (total !== cartCount) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  }

  return (
    <motion.nav
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* ===================== BRAND / LOGO ===================== */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="p-2 rounded-xl bg-gradient-to-r from-orange-50 to-purple-50 shadow-sm border border-white/60"
          >
            <img
              src="/logo/logo.png"
              alt="SurpriseVista Logo"
              className="w-40 h-auto drop-shadow-sm group-hover:drop-shadow-md transition"
            />
          </motion.div>
        </Link>

        {/* ===================== DESKTOP NAV LINKS ===================== */}
        <div className="hidden md:flex items-center gap-10 font-medium text-sm">
          <Link to="/" className="hover:text-sv-purple transition">Home</Link>
          <Link to="/products" className="hover:text-sv-purple transition">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple transition">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple transition">Blog</Link>

          {/* CART ICON */}
          <Link to="/cart" className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="currentColor"
              className={`w-7 h-7 transition-transform duration-300 ${
                pulse ? "scale-125" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 8h12l2-8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full shadow animate-fadeIn">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT BUTTON */}
          <button
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
            title="Account"
          >
            Account
          </button>
        </div>

        {/* ===================== MOBILE MENU BUTTON ===================== */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded bg-gray-100 text-xl"
          >
            {mobileOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* ===================== MOBILE DROPDOWN ===================== */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-inner">
          <div className="px-6 py-4 flex flex-col gap-4 text-base font-medium">
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link
              to="/cart"
              className="flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <img src="/icons/ShoppingCart.png" alt="cart" className="w-5 h-5" />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
