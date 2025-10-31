import React from "react";
import heroImg from "../assets/hero.jpg"; // ✅ Ensure file exists in /src/assets/

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl text-sv-purple font-heading mb-4">
            Making Every Moment Special
          </h1>
          <p className="text-gray-700 mb-4">
            Curated gifts, custom packaging, and fast delivery.
          </p>
          <a
            href="#/products"
            className="bg-sv-orange text-white px-6 py-3 rounded-md shadow hover:bg-orange-600 transition"
          >
            Shop Now
          </a>
        </div>
        <div>
          <img
            src={heroImg}
            alt="Hero"
            className="rounded-2xl shadow-lg w-full object-cover"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      </div>
    </section>
  );
}
