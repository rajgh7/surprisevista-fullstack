// src/components/SuccessModal.jsx
import React from "react";
import { motion } from "framer-motion";

export default function SuccessModal({ open, title = "Success", children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.28 }}
        className="bg-white rounded-2xl p-6 shadow-floating w-full max-w-md z-10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-50 rounded-full p-3">
            <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <div className="text-sm text-gray-600 text-center">{children}</div>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded bg-sv-orange text-white">
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
