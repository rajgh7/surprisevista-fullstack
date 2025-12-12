// client/src/pages/Contact.jsx
import React, { useState } from "react";
import { API_URL } from "../config"; // ensure this exists in your frontend config
import { softCelebrate } from "../utils/confetti";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", msg: "Sending..." });

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit");

      // 🎉 SOFT CELEBRATION
      softCelebrate();

      setStatus({ type: "success", msg: "Message sent successfully!" });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to send. Try again!" });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-24 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>

      {status.msg && (
        <div className={`p-3 mb-3 rounded ${
          status.type === "success"
            ? "bg-green-100 text-green-700"
            : status.type === "error"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="border p-2 w-full rounded"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="border p-2 w-full rounded"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="border p-2 w-full rounded"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <textarea
          className="border p-2 w-full rounded"
          name="message"
          placeholder="Message"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button className="bg-sv-purple text-white px-4 py-2 rounded hover:bg-purple-700">
          {status.type === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
