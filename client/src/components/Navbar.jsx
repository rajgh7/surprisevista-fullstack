// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="SurpriseVista Logo"
            className="h-16 w-16 rounded-lg object-cover shadow border border-sv-purple/20"
          />
          <div>
            <h1 className="text-2xl font-bold text-sv-purple">Surprise <br />Vista</h1>
            <p className="text-sm text-sv-orange">Unbox Happiness</p>
          </div>
        </div>

        {/* Menu button for mobile */}
        <button
          className="md:hidden block text-sv-purple"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <div
          className={`md:flex items-center space-x-6 text-base font-medium ${
            open
              ? "block absolute top-16 left-0 w-full bg-white shadow-md md:relative md:shadow-none text-center py-4"
              : "hidden md:flex"
          }`}
        >
          <Link to="/" className="hover:text-sv-orange block py-2">
            Home
          </Link>
          <Link to="/products" className="hover:text-sv-orange block py-2">
            Products
          </Link>
          <Link to="/contact" className="hover:text-sv-orange block py-2">
            Contact
          </Link>
          <Link to="/cart" className="hover:text-sv-orange block py-2">
            Cart
          </Link>
          <Link to="/admin" className="hover:text-sv-orange block py-2">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
