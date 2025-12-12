// client/src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-sv-purple text-white py-14 mt-16 rounded-t-[30px] shadow-xl">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        {/* BRAND & PHONE */}
        <div>
          <img src="/logo/logo.png" alt="SurpriseVista" className="w-32 mb-4" />

          <p className="text-sm opacity-90 leading-relaxed">
            Premium gifting solutions crafted with love and delivered with care.
          </p>

          <div className="mt-5">
            <p className="text-sm opacity-90 font-semibold">Call Us:</p>
            <a
              href="tel:+919999999999"
              className="text-lg font-bold text-white hover:text-sv-orange transition"
            >
              +91 99999 99999
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/products">Shop Gifts</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        {/* POLICIES */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Policies</h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/refund">Refund Policy</Link></li>
          </ul>
        </div>

        {/* SUBSCRIBE */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Subscribe</h4>
          <p className="text-sm opacity-90 mb-3">
            Offers, ideas & new launches. No spam.
          </p>

          <div className="flex gap-2">
            <input
              placeholder="Email"
              className="px-4 py-2 rounded-md text-black w-full"
            />
            <button className="bg-sv-orange px-4 py-2 rounded-md text-white">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      <p className="text-center text-white/70 text-sm mt-10">
        © {new Date().getFullYear()} SurpriseVista — All Rights Reserved.
      </p>
    </footer>
  );
}
