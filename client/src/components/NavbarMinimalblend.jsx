// client/src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [pulse, setPulse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const [shrink, setShrink] = useState(false);

  const location = useLocation();
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  /* Load cart count */
  useEffect(() => updateCart(), [location]);

  useEffect(() => {
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  function updateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
      const total = cart.reduce((sum, p) => sum + (p.qty || 1), 0);
      if (total !== cartCount) {
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
      setCartCount(total);
    } catch {}
  }

  /* Scroll shrink effect */
  useEffect(() => {
    const onScroll = () => setShrink(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* SEARCH FUNCTIONALITY — Live Product Suggestions */
  async function handleSearchInput(text) {
    setSearch(text);

    if (!text.trim()) {
      setShowSearch(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();

      const all = Array.isArray(data)
        ? data
        : [];

      const filtered = all.filter((p) =>
        p.name.toLowerCase().includes(text.toLowerCase())
      );

      setSearchResults(filtered.slice(0, 5));
      setShowSearch(true);
    } catch (err) {
      console.error("Search error", err);
    }
  }

  /* On search submit (Enter key or clicking search icon) */
  function submitSearch() {
    if (!search.trim()) return;
    navigate(`/products?search=${encodeURIComponent(search)}`);
    setShowSearch(false);
  }

  /* Clicking a suggestion */
  function openProduct(id) {
    navigate(`/product/${id}`);
    setShowSearch(false);
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={`
        fixed top-0 left-0 right-0 z-50
        backdrop-blur-2xl bg-white/30 border-b border-white/20 shadow-sm
        transition-all duration-300
        ${shrink ? "py-2 bg-white/40 shadow-md" : "py-4"}
      `}
      style={{
        WebkitBackdropFilter: "blur(20px)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="group flex items-center">
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="
              p-2 rounded-2xl 
              bg-gradient-to-r from-purple-50/50 to-pink-50/50
              border border-white/50 shadow-sm
            "
          >
            <img
              src="/logo/logo.png"
              alt="logo"
              className={`${shrink ? "w-32" : "w-44"} transition-all duration-300`}
            />
          </motion.div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10 text-sm font-medium">

          <Link to="/" className="hover:text-sv-purple transition">Home</Link>
          <Link to="/products" className="hover:text-sv-purple transition">Products</Link>
          <Link to="/contact" className="hover:text-sv-purple transition">Contact</Link>
          <Link to="/blog" className="hover:text-sv-purple transition">Blog</Link>

          {/* SEARCH BAR */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search gifts…"
              value={search}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              className="
                px-4 py-2 rounded-full border shadow-sm w-72
                bg-white/60 backdrop-blur
                focus:ring-2 focus:ring-sv-purple
              "
            />

            {/* SEARCH DROPDOWN */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-50 mt-2 w-72 bg-white shadow-lg rounded-xl border max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => openProduct(item._id)}
                  >
                    <img
                      src={item.image || "/placeholders/product.png"}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA BUTTON */}
          <Link
            to="/products"
            className="
              bg-gradient-to-r from-sv-orange to-sv-purple
              text-white px-5 py-2 rounded-full shadow-lg
              hover:scale-105 transition
            "
          >
            Gift Finder 🎁
          </Link>

          {/* CART + DROPDOWN */}
          <div
            className="relative"
            onMouseEnter={() => setShowCart(true)}
            onMouseLeave={() => setShowCart(false)}
          >
            <Link to="/cart" className="relative flex items-center">
              <img
                src="/icons/ShoppingCart.png"
                alt="Cart"
                className={`w-8 h-8 transition-transform ${
                  pulse ? "scale-125" : ""
                }`}
              />
              {cartCount > 0 && (
                <span className="
                  absolute -top-2 -right-2 bg-red-600 text-white text-xs 
                  px-2 rounded-full shadow animate-fadeIn
                ">
                  {cartCount}
                </span>
              )}
            </Link>

            {showCart && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border shadow-lg rounded-xl p-4 text-sm">
                <h4 className="font-semibold mb-2">Cart Preview</h4>
                {cartItems.length === 0 && (
                  <p className="text-gray-500">Your cart is empty.</p>
                )}
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>{item.name}</span>
                    <span>x{item.qty}</span>
                  </div>
                ))}
                <Link
                  to="/cart"
                  className="block text-center bg-sv-purple text-white py-2 rounded-lg mt-3 hover:bg-sv-orange"
                >
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-white/50 backdrop-blur text-xl shadow-sm"
          >
            {mobileOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t shadow-inner">
          <div className="px-6 py-4 flex flex-col gap-5 text-base font-medium">
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>

            {/* MOBILE SEARCH */}
            <input
              placeholder="Search gifts…"
              value={search}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              className="px-4 py-2 rounded-full border shadow-sm bg-white"
            />

            <Link
              to="/products"
              className="bg-gradient-to-r from-sv-orange to-sv-purple text-white px-4 py-2 rounded-full text-center shadow"
              onClick={() => setMobileOpen(false)}
            >
              Gift Finder 🎁
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <img src="/icons/ShoppingCart.png" className="w-6 h-6" />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
