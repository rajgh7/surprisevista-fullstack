import React from "react";

export default function Home() {
  return (
    <div className="pt-20">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-pink-50 via-white to-yellow-50 text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Personalized Gifts for Every Occasion 🎁
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Whether it’s a birthday, wedding, corporate event, or just a moment to show you care —
          SurpriseVista crafts meaningful gifts wrapped with love and delivered with care.
        </p>
        <div className="space-x-4">
          <a
            href="#party"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow-md transition"
          >
            Start Planning Your Event
          </a>
          <a
            href="#corporate"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-full shadow-md transition"
          >
            Request a Custom Quote
          </a>
          <a
            href="/products"
            className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-6 py-3 rounded-full shadow-md transition"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* PARTY RETURN GIFTS SECTION */}
      <section id="party" className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Party Return Gifts 🎉</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10">
          Theme consultation, personalized tags, and beautiful packaging for your celebrations.
          Perfect for birthdays, baby showers, weddings, and more!
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <img src="/party1.jpg" alt="Party Gift 1" className="rounded-xl w-64 h-64 object-cover shadow-lg hover:scale-105 transition-transform" />
          <img src="/party2.jpg" alt="Party Gift 2" className="rounded-xl w-64 h-64 object-cover shadow-lg hover:scale-105 transition-transform" />
          <img src="/party3.jpg" alt="Party Gift 3" className="rounded-xl w-64 h-64 object-cover shadow-lg hover:scale-105 transition-transform" />
        </div>
        <a href="/contact" className="inline-block mt-8 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow">
          Start Planning Your Event
        </a>
      </section>

      {/* CORPORATE ORDERS SECTION */}
      <section id="corporate" className="bg-gradient-to-r from-yellow-50 to-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Corporate & Bulk Orders 💼</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          Simplify your corporate gifting — from inquiry to delivery:
        </p>
        <p className="text-gray-800 font-medium mb-6">
          Inquiry → Quote → Sample → Production → Delivery
        </p>
        <ul className="text-gray-600 mb-10 max-w-xl mx-auto space-y-2 text-left">
          <li>✔️ GST Billing for all orders</li>
          <li>✔️ Logo inclusion and customization options</li>
          <li>✔️ Dedicated account manager</li>
          <li>✔️ Volume discounts on bulk orders</li>
        </ul>
        <a href="/contact" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-full shadow">
          Request a Custom Quote
        </a>
      </section>

      {/* RETAIL GIFTS SECTION */}
      <section id="retail" className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Retail Gifting 🛍️</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10">
          Unique handpicked gifts with high-quality finish, customizable wrapping, and quick delivery options.
        </p>
        <a href="/products" className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow">
          Shop Now
        </a>
      </section>

      {/* PROCESS IMAGE SECTION */}
      <section className="bg-gradient-to-r from-white to-pink-50 py-20" id="process">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">How We Make It Happen</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            From your idea to the perfect gift — simple, quick, and beautifully wrapped.
          </p>
          <div className="flex justify-center">
            <img src="/Process.png" alt="Gift Order Process" className="rounded-xl shadow-lg w-full max-w-4xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
