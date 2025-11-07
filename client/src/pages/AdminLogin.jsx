import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://surprisevista-backend.onrender.com/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token
      localStorage.setItem("adminToken", data.token);

      // Redirect to Admin Dashboard
      navigate("/admin");
    } catch (err) {
      console.error("❌ Admin login failed:", err);
      setError("Invalid credentials or server error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg p-8 rounded-lg w-96 border"
      >
        <h1 className="text-2xl text-sv-purple font-heading mb-4 text-center">
          Admin Login
        </h1>

        {error && (
          <div className="text-red-500 text-sm text-center mb-2">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />

        <button
          type="submit"
          className="w-full bg-sv-orange text-white py-2 rounded hover:bg-orange-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
