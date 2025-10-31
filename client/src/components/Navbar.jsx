import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Use BASE_URL so logo loads correctly on GitHub Pages & locally
  const logoSrc = `${import.meta.env.BASE_URL}logo.jpg`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="SurpriseVista Logo"
            className="h-16 w-auto object-contain rounded-md border border-sv-purple/20 shadow-sm"
            onError={(e) => (e.target.style.display = "none")}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-base font-medium">
          <Link to="/" className="hover:text-sv-orange transition">Home</Link>
          <Link to="/products" className="hover:text-sv-orange transition">Products</Link>
          <Link to="/contact" className="hover:text-sv-orange transition">Contact</Link>
          <Link to="/cart" className="hover:text-sv-orange transition">Cart</Link>
          <Link to="/admin" className="hover:text-sv-orange transition">Admin</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none text-sv-purple"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg py-4 space-y-3 text-center">
          <Link onClick={() => setIsOpen(false)} to="/" className="block hover:text-sv-orange">
            Home
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/products" className="block hover:text-sv-orange">
            Products
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/contact" className="block hover:text-sv-orange">
            Contact
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/cart" className="block hover:text-sv-orange">
            Cart
          </Link>
          <Link onClick={() => setIsOpen(false)} to="/admin" className="block hover:text-sv-orange">
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
