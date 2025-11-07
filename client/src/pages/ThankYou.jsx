import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function ThankYou() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-white text-center px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full animate-fadeIn">
        <h1 className="text-3xl font-heading text-sv-purple mb-2">
          🎁 Thank You for Your Order!
        </h1>
        <p className="text-gray-600 mb-4">
          We’ve received your order and will process it shortly.
        </p>

        {order && (
          <div className="bg-pink-50 rounded-lg p-4 mb-4 text-left">
            <h2 className="text-sv-purple font-semibold mb-2">Order Summary:</h2>
            <ul className="space-y-2 text-gray-700">
              {order.items?.map((item, i) => (
                <li key={i}>
                  {item.name} — ₹{item.price} × {item.qty || 1}
                </li>
              ))}
            </ul>
            <p className="font-semibold text-right mt-2">
              Total: ₹{order.total}
            </p>
          </div>
        )}

        <Link
          to="/"
          className="bg-sv-orange text-white px-6 py-3 rounded shadow hover:bg-orange-600 transition"
        >
          Continue Shopping
        </Link>
      </div>

      <footer className="text-sm text-gray-500 mt-6">
        © {new Date().getFullYear()} SurpriseVista
      </footer>
    </div>
  );
}
