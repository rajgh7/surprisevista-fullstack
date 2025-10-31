import React from "react";

export default function Home() {
  // ✅ Attempt to import hero image from src/assets; fallback to public path if missing
  let heroImg;
  try {
    heroImg = new URL("../assets/hero.jpg", import.meta.url).href;
  } catch {
    heroImg = `${import.meta.env.BASE_URL}hero.jpg`;
  }

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
