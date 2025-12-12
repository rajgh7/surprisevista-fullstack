// client/src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => updateCartCount(), [location]);

  useEffect(() => {
    const listener = () => updateCartCount();
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      if (total !== cartCount) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="
        fixed top-0 left-0 right-0 z-40 
        backdrop-blur-xl bg-white/30 
        shadow-[0_8px_20px_rgba(0,0,0,0.05)]
        border-b border-white/20
        supports-backdrop-blur:bg-white/20
      "
      style={{
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* ===================== LOGO (Glass Capsule) ===================== */}
        <Link to="/" className="group flex items-center">
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="
              p-2 rounded-2xl 
              bg-gradient-to-r from-purple-50/60 to-pink-50/60
              border border-white/40 shadow-sm
              transition-all
            "
          >
            <img
              src="/logo/logo.png"
              alt="SurpriseVista Logo"
              className="w-44 drop-shadow-sm group-hover:drop-shadow-md transition"
            />
          </motion.div>
        </Link>

        {/* ===================== DESKTOP LINKS (Minimal + Elegant) ===================== */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">

          <Link to="/" className="hover:text-sv-purple transition">Home</Link>
          <Link to="/products" className="hover:text-sv-purple transition">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple transition">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple transition">Blog</Link>

          {/* CTA BUTTON */}
          <Link
            to="/products"
            className="
              bg-gradient-to-r from-sv-orange to-sv-purple
              text-white px-5 py-2 rounded-full
              shadow-lg shadow-orange-200/40
              hover:shadow-purple-300/40 hover:scale-[1.03]
              transition-all
            "
          >
            Gift Finder 🎁
          </Link>

          {/* CART ICON */}
          <Link to="/cart" className="relative flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="currentColor"
              className={`w-7 h-7 transition-transform ${
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
              <span className="
                absolute -top-2 -right-2 
                bg-red-600 text-white text-xs 
                px-2 rounded-full shadow animate-fadeIn
              ">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* ===================== MOBILE MENU BUTTON ===================== */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded bg-white/60 backdrop-blur text-xl shadow-sm"
          >
            {mobileOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* ===================== MOBILE MENU ===================== */}
      {mobileOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-white/30 shadow-inner">
          <div className="px-6 py-4 flex flex-col gap-5 text-base font-medium">

            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>

            {/* Mobile CTA */}
            <Link
              to="/products"
              className="
                bg-gradient-to-r from-sv-orange to-sv-purple
                text-white px-4 py-2 rounded-full text-center shadow
              "
              onClick={() => setMobileOpen(false)}
            >
              Gift Finder 🎁
            </Link>

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
