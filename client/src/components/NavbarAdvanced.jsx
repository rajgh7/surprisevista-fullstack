// client/src/components/Navbar.jsx (Advanced Version)
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavbarAdvanced() {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState("");

  const location = useLocation();

  useEffect(() => updateCart(), [location]);

  function updateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
      setCartCount(cart.reduce((s, p) => s + (p.qty || 1), 0));
    } catch {}
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo/logo.png"
            className="w-40 hover:scale-105 transition"
            alt="logo"
          />
        </Link>

        {/* SEARCH BAR */}
        <div className="hidden md:flex items-center flex-1 mx-10">
          <input
            type="text"
            placeholder="Search gifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-full shadow-sm focus:ring-2 focus:ring-sv-purple"
          />
        </div>

        {/* LINKS + CART DROPDOWN */}
        <div className="hidden md:flex items-center gap-8 text-sm">

          <Link to="/" className="hover:text-sv-purple">Home</Link>
          <Link to="/products" className="hover:text-sv-purple">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple">Blog</Link>

          {/* CART WRAPPER */}
          <div
            className="relative"
            onMouseEnter={() => setShowCart(true)}
            onMouseLeave={() => setShowCart(false)}
          >
            <Link to="/cart" className="relative text-xl">🛒</Link>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 rounded-full">
                {cartCount}
              </span>
            )}

            {/* CART DROPDOWN */}
            {showCart && (
              <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded-lg p-4 text-sm">
                <h4 className="font-semibold mb-2">Cart Preview</h4>

                {cartItems.length === 0 && <p className="text-gray-500">Cart is empty</p>}

                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span>x{item.qty}</span>
                  </div>
                ))}

                <Link
                  to="/cart"
                  className="block text-center bg-sv-purple text-white py-2 rounded mt-3 hover:bg-sv-orange"
                >
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
