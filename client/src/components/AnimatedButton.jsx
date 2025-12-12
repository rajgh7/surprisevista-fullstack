// src/components/AnimatedButton.jsx
import React from "react";

export default function AnimatedButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm bg-sv-orange text-white btn-animated ${className}`}
    >
      {children}
    </button>
  );
}
