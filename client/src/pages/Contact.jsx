import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", msg: "" });

  // ✅ Use your Render backend URL here
  const API_BASE = "https://surprisevista-backend.onrender.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", msg: "Sending your message..." });

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", msg: "✅ Message sent successfully!" });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        msg: "❌ Failed to send. Please try again later.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-heading text-sv-purple mb-4">
        Contact Us
      </h1>
      <p className="text-gray-700 mb-8">
        Have questions or need a custom quote? We’d love to hear from you!
      </p>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow"
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-sv-orange"
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-sv-orange"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-sv-orange md:col-span-2"
        />

        <textarea
          name="message"
          placeholder="Your Message..."
          value={formData.message}
          onChange={handleChange}
          required
          rows="5"
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-sv-orange md:col-span-2"
        ></textarea>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="bg-sv-orange text-white py-3 px-6 rounded shadow hover:bg-orange-600 transition md:col-span-2"
        >
          {status.type === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status.msg && (
        <p
          className={`mt-4 text-center text-lg ${
            status.type === "success"
              ? "text-green-600"
              : status.type === "error"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
}
