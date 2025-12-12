// client/src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 py-20">
      <div className="text-center bg-white p-10 rounded-lg shadow">
        <h1 className="text-5xl font-bold text-sv-purple">404</h1>
        <p className="mt-3 text-gray-700">We couldn't find that page.</p>
        <Link to="/" className="mt-6 inline-block bg-sv-purple text-white px-4 py-2 rounded">Go home</Link>
      </div>
    </div>
  );
}
