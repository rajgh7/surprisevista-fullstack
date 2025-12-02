// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/*
  Improved Navbar:
  ✔ Cleaned imports (no duplication)
  ✔ Cart count sync
  ✔ Pulse animation
  ✔ Fade-in + logo animation retained
  ✔ Works with upcoming chatbot cartCount syncing
*/

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [pulse, setPulse] = useState(false);
  const location = useLocation();

  // Update cart count whenever route changes
  useEffect(() => {
    updateCartCount();
  }, [location]);

  // Listen for localStorage changes (cart updates)
  useEffect(() => {
    const listener = () => updateCartCount();
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  // Read cart from localStorage or chatbot future session
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      let total = 0;
      cart.forEach((item) => {
        total += item.qty || 1;
      });

      if (total !== cartCount) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }

      setCartCount(total);
    } catch (e) {
      console.error("Cart read error:", e);
      setCartCount(0);
    }
  }

  return (
    <nav className="shadow bg-white py-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6">

        {/* LOGO WITH ANIMATIONS */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="logo.png"
            alt="SurpriseVista Logo"
            className={`w-20 h-auto drop-shadow-xl transition-all duration-500 
              hover:rotate-6 hover:scale-110 hover:brightness-110 
              ${pulse ? "animate-pulseLogo" : ""}
            `}
          />

          <div>
            <h1 className="text-2xl font-extrabold text-sv-purple animate-bounceSlow">
              Surprise <br /> Vista
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Unbox Happiness</p>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/admin">Admin</Link>

          {/* CART ICON */}
          <Link to="/cart" className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
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
        </div>
      </div>
    </nav>
  );
}
