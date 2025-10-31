import React from "react";

export default function Home() {
  // All images now load dynamically — works in local + GitHub Pages
  const hero = `${import.meta.env.BASE_URL}hero.jpg`;
  const party1 = `${import.meta.env.BASE_URL}party1.jpg`;
  const party2 = `${import.meta.env.BASE_URL}party2.jpg`;
  const party3 = `${import.meta.env.BASE_URL}party3.jpg`;
  const process = `${import.meta.env.BASE_URL}Process.png`;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
      {/* HERO SECTION */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading text-sv-purple mb-4">
            Personalized Gifts for Every Occasion 🎁
          </h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Whether it’s a birthday, wedding, corporate event, or just a moment
            to show you care — SurpriseVista crafts meaningful gifts wrapped
            with love and delivered with care.
          </p>
          <div className="space-x-3">
            <a
              href="/#/products"
              className="bg-sv-orange text-white px-6 py-3 rounded-md shadow hover:bg-orange-600 transition"
            >
              Shop Now
            </a>
            <a
              href="/#/contact"
              className="border border-sv-orange text-sv-orange px-6 py-3 rounded-md hover:bg-orange-50 transition"
            >
              Request a Custom Quote
            </a>
          </div>
        </div>
        <div>
          <img
            src={hero}
            alt="SurpriseVista Gifts"
            className="rounded-2xl shadow-lg w-full object-cover"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      </section>

      {/* PARTY RETURN GIFTS SECTION */}
      <section>
        <h2 className="text-3xl font-heading text-sv-purple mb-3">
          Party Return Gifts 🎉
        </h2>
        <p className="text-gray-700 mb-6">
          Theme consultation, personalized tags, and beautiful packaging for
          your celebrations. Perfect for birthdays, baby showers, weddings, and
          more!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <img src={party1} alt="Party Gift 1" className="rounded-lg shadow" />
          <img src={party2} alt="Party Gift 2" className="rounded-lg shadow" />
          <img src={party3} alt="Party Gift 3" className="rounded-lg shadow" />
        </div>
        <div className="mt-6">
          <a
            href="/#/contact"
            className="bg-sv-orange text-white px-6 py-3 rounded-md shadow hover:bg-orange-600 transition"
          >
            Start Planning Your Event
          </a>
        </div>
      </section>

      {/* CORPORATE SECTION */}
      <section>
        <h2 className="text-3xl font-heading text-sv-purple mb-3">
          Corporate & Bulk Orders 💼
        </h2>
        <p className="text-gray-700 mb-6">
          Simplify your corporate gifting — from inquiry to delivery:
          <br />
          <strong>Inquiry → Quote → Sample → Production → Delivery</strong>
        </p>
        <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-6">
          <li>✔️ GST Billing for all orders</li>
          <li>✔️ Logo inclusion and customization options</li>
          <li>✔️ Dedicated account manager</li>
          <li>✔️ Volume discounts on bulk orders</li>
        </ul>
        <a
          href="/#/contact"
          className="border border-sv-orange text-sv-orange px-6 py-3 rounded-md hover:bg-orange-50 transition"
        >
          Request a Custom Quote
        </a>
      </section>

      {/* RETAIL SECTION */}
      <section>
        <h2 className="text-3xl font-heading text-sv-purple mb-3">
          Retail Gifting 🛍️
        </h2>
        <p className="text-gray-700 mb-6">
          Unique handpicked gifts with high-quality finish, customizable
          wrapping, and quick delivery options.
        </p>
        <a
          href="/#/products"
          className="bg-sv-orange text-white px-6 py-3 rounded-md shadow hover:bg-orange-600 transition"
        >
          Shop Now
        </a>
      </section>

      {/* PROCESS SECTION */}
      <section className="text-center">
        <h2 className="text-3xl font-heading text-sv-purple mb-3">
          How We Make It Happen
        </h2>
        <p className="text-gray-700 mb-6">
          From your idea to the perfect gift — simple, quick, and beautifully
          wrapped.
        </p>
        <img
          src={process}
          alt="Gift Order Process"
          className="mx-auto rounded-lg shadow-md max-w-full"
          onError={(e) => (e.target.style.display = "none")}
        />
      </section>
    </div>
  );
}
