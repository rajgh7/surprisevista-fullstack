import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAssetPath } from "../utils/getAssetPath";

export default function Navbar() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("sv_cart") || "[]");
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    setCartCount(count);
  };

  // Run update when navigating between pages
  useEffect(() => {
    updateCartCount();
  }, [location]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
<img src={getAssetPath("logo.jpg")} alt="SurpriseVista Logo"
            className="h-16 w-16 rounded-lg object-cover shadow-md border border-sv-purple/20"
  />
         
          <div>
            <div className="text-2xl font-heading text-sv-purple leading-none tracking-wide">
              SurpriseVista
            </div>
            <div className="text-sm text-sv-orange font-medium tracking-tight">
              Unbox Happiness
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-6 text-base font-medium">
          <Link to="/" className="hover:text-sv-orange transition">Home</Link>
          <Link to="/products" className="hover:text-sv-orange transition">Products</Link>
          <Link to="/contact" className="hover:text-sv-orange transition">Contact</Link>
          <Link to="/admin" className="hover:text-sv-orange transition">Admin</Link>

          {/* Cart with live count */}
          <Link to="/cart" className="relative hover:text-sv-orange transition">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-sv-orange text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
