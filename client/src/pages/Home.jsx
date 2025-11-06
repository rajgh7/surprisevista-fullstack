import React from "react";
import { getAssetPath } from "../utils/getAssetPath"; // adjust relative path if needed

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-yellow-50 to-white">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-heading text-sv-purple leading-tight">
              Personalized Gifts for Every Occasion
            </h1>
            <p className="text-gray-700 max-w-xl">
              Whether it’s a birthday, wedding, corporate event, or just a moment
              to show you care — SurpriseVista crafts meaningful gifts wrapped with love and delivered with care.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#/products"
                className="inline-flex items-center bg-gradient-to-r from-pink-200 to-yellow-200 border border-sv-orange text-sv-purple px-6 py-3 rounded-lg font-medium shadow hover:scale-[1.01] transition"
              >
                Shop Now
              </a>

              <a
                href="#contact"
                className="inline-flex items-center border border-sv-orange text-sv-orange px-6 py-3 rounded-lg hover:bg-pink-50 transition"
              >
                Request a Custom Quote
              </a>
            </div>

            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-sv-purple">150+</div>
                <div className="text-sm text-gray-600">Curated Gifts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sv-purple">500km</div>
                <div className="text-sm text-gray-600">Service Radius</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sv-purple">100%</div>
                <div className="text-sm text-gray-600">Crafted with Love</div>
              </div>
            </div>
          </div>

          <div className="animate-fadeIn">
            <img
              src={getAssetPath("hero.jpg")}
              alt="SurpriseVista Gifts hero"
              className="rounded-2xl shadow-xl w-full object-cover max-h-[420px]"
            />
          </div>
        </div>
      </section>

      {/* THREE CORE SECTIONS */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Party Return Gifts */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/60 rounded-2xl p-6 shadow">
          <img
            src={getAssetPath("party1.jpg")}
            alt="Party return gifts"
            className="w-full rounded-lg object-cover h-56"
          />
          <div>
            <h2 className="text-2xl font-heading text-sv-purple mb-3">Party Return Gifts 🎉</h2>
            <p className="text-gray-700 mb-4">
              Theme consultation, personalized tags, and beautiful packaging for your celebrations — birthdays, baby showers, weddings and more.
            </p>
            <a href="#/products" className="text-sv-orange font-medium hover:underline">Shop Party Gifts →</a>
          </div>
        </div>

        {/* Corporate */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/60 rounded-2xl p-6 shadow md:flex-row-reverse">
          <img
            src={getAssetPath("party2.jpg")}
            alt="Corporate gifting"
            className="w-full rounded-lg object-cover h-56"
          />
          <div>
            <h2 className="text-2xl font-heading text-sv-purple mb-3">Corporate & Bulk Orders 💼</h2>
            <p className="text-gray-700 mb-4">
              Inquiry → Quote → Sample → Production → Delivery. GST billing, logo inclusion, dedicated account manager and volume discounts.
            </p>
            <a href="#contact" className="text-sv-orange font-medium hover:underline">Request a Custom Quote →</a>
          </div>
        </div>

        {/* Retail */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-white/60 rounded-2xl p-6 shadow">
          <img
            src={getAssetPath("party3.jpg")}
            alt="Retail gifting"
            className="w-full rounded-lg object-cover h-56"
          />
          <div>
            <h2 className="text-2xl font-heading text-sv-purple mb-3">Retail Gifting 🛍️</h2>
            <p className="text-gray-700 mb-4">
              Unique handpicked gifts with high-quality finish and quick delivery. Personalize your order at checkout.
            </p>
            <a href="#/products" className="text-sv-orange font-medium hover:underline">Shop Now →</a>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section className="bg-white/70 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-heading text-sv-purple mb-4">How We Make It Happen</h3>
          <p className="text-gray-700 mb-6">
            From your idea to the perfect gift — simple, quick and beautifully wrapped.
          </p>

          <div className="grid md:grid-cols-4 gap-6 mt-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-pink-50 shadow">
              <div className="text-xl font-bold text-sv-purple mb-2">1. Consult</div>
              <div className="text-sm text-gray-600">Theme selection & customization</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-pink-50 shadow">
              <div className="text-xl font-bold text-sv-purple mb-2">2. Sample</div>
              <div className="text-sm text-gray-600">Approve packaging & personalization</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-pink-50 shadow">
              <div className="text-xl font-bold text-sv-purple mb-2">3. Produce</div>
              <div className="text-sm text-gray-600">Assemble and quality check</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-white to-pink-50 shadow">
              <div className="text-xl font-bold text-sv-purple mb-2">4. Deliver</div>
              <div className="text-sm text-gray-600">Hassle-free delivery & tracking</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} SurpriseVista. All rights reserved.
      </section>
    </main>
  );
}
