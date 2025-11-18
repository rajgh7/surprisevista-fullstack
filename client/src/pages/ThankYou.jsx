import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Optional confetti effect (no library needed)
function launchConfetti() {
  const duration = 1 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff6f91", "#ff9671", "#ffc75f", "#f9f871"],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff6f91", "#ff9671", "#ffc75f", "#f9f871"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Confetti on mount
  useEffect(() => {
    setTimeout(() => {
      try {
        launchConfetti();
      } catch (e) {
        console.log("Confetti not available");
      }
    }, 300);
  }, []);

  // Optional auto-redirect after 15 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => navigate("/"), 15000);
  //   return () => clearTimeout(timer);
  // }, []);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center p-6">
        <h2 className="text-3xl font-bold text-sv-purple mb-4">Order Received</h2>
        <p className="text-gray-600">Thank you for your purchase!</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-sv-orange text-white px-6 py-3 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center px-6 py-12 bg-gradient-to-b from-pink-50 to-white text-center">

      {/* Success Icon */}
      <div className="bg-white rounded-full shadow-lg w-20 h-20 flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-green-500"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-heading text-sv-purple mb-4 animate-fade-in">
        Thank You! 🎉
      </h1>

      <p className="text-gray-700 max-w-sm mb-4">
        We’ve received your order and our team is preparing something wonderful for you.
      </p>

      {/* Order Code */}
      <div className="bg-white p-4 rounded-lg shadow-md inline-block border border-sv-orange mb-6">
        <p className="text-gray-600 text-sm">Your Order Code</p>
        <p className="text-2xl font-bold text-sv-purple">
          {order.orderCode}
        </p>
      </div>

      {/* WhatsApp Contact Button */}
      <a
        href={`https://wa.me/91${order.phone || ""}?text=Hi, I want to track my order ${order.orderCode}`}
        target="_blank"
        className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 transition mb-4"
      >
        Track Order on WhatsApp
      </a>

      {/* Continue Shopping */}
      <button
        onClick={() => navigate("/")}
        className="bg-sv-orange text-white px-6 py-3 rounded shadow hover:bg-sv-orange/90 transition"
      >
        Continue Shopping
      </button>

      {/* Info */}
      <p className="text-gray-500 text-sm mt-6">
        A confirmation has been sent to <strong>{order.email}</strong>
      </p>
    </div>
  );
}
