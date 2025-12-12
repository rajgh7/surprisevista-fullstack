// src/pages/ThankYou.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fireworks } from "../utils/confetti";

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => { setTimeout(() => fireworks(2500), 300); }, []);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center px-6 pt-32 pb-12 bg-gradient-to-b from-pink-50 to-white text-center">

        <h2 className="text-3xl font-bold text-sv-purple mb-4">Order Received</h2>
        <button onClick={() => navigate("/")} className="mt-6 bg-sv-orange text-white px-6 py-3 rounded">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center px-6 py-12 bg-gradient-to-b from-pink-50 to-white text-center">
      <div className="checkmark-wrapper mb-6">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
        </svg>
      </div>
      <h1 className="text-4xl font-heading text-sv-purple mb-4 animate-fadeIn">Thank You! 🎉</h1>
      <p className="text-gray-700 max-w-sm mb-4">Your order has been successfully placed. We’re preparing something wonderful for you!</p>

      <div className="bg-white p-4 rounded-lg shadow-md inline-block border border-sv-orange mb-6">
        <p className="text-gray-600 text-sm">Order Code</p>
        <p className="text-2xl font-bold text-sv-purple">{order.orderCode}</p>
      </div>

      <a href={`https://wa.me/91${order.phone || ""}?text=Hi, I want to track my order ${order.orderCode}`} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 transition mb-4">Track Order on WhatsApp</a>

      <button onClick={() => navigate("/")} className="bg-sv-orange text-white px-6 py-3 rounded shadow hover:bg-sv-orange/90 transition">Continue Shopping</button>

      <p className="text-gray-500 text-sm mt-6">Confirmation sent to <strong>{order.email}</strong></p>

      <style>{`
        .checkmark-wrapper { width: 80px; height: 80px; }
        .checkmark { width: 80px; height: 80px; stroke-width: 4; stroke: #4CAF50; }
        .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: stroke 0.6s ease-in-out forwards; }
        .checkmark-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s 0.6s ease-in-out forwards; }
        @keyframes stroke { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
