// client/src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

/* ------------------------------------------------------------- */
/*  BESTSELLERS (STATIC FOR NOW — CAN CONNECT TO API LATER)      */
/* ------------------------------------------------------------- */
const bestsellers = [
  {
    id: 1,
    name: "Luxury Celebration Hamper",
    price: 1499,
    image: "/categories/sample1.jpg", // Update to your actual file
  },
  {
    id: 2,
    name: "Kids Return Gift Pack",
    price: 299,
    image: "/categories/sample2.jpg",
  },
  {
    id: 3,
    name: "Corporate Chocolate Box",
    price: 899,
    image: "/categories/sample3.jpg",
  },
];

/* ------------------------------------------------------------- */
/* MAIN HOME COMPONENT                                            */
/* ------------------------------------------------------------- */
export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-pink-100/40 to-white">

        {/* =============================================================== */}
        {/* HERO SECTION */}
        {/* =============================================================== */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading text-sv-purple leading-tight mb-4">
              Thoughtful Gifts for Every Occasion 🎁  
            </h1>

            <p className="text-gray-700 text-lg mb-6 max-w-md">
              Discover curated gift hampers, party returns, and personalized gifting options crafted with love and delivered with care.
            </p>

            <div className="flex gap-4 mb-8">
              <Link
                to="/products"
                className="px-6 py-3 rounded-lg bg-sv-orange text-white font-medium btn-animated"
              >
                Shop Now
              </Link>

              <Link
                to="/contact"
                className="px-6 py-3 rounded-lg border border-sv-orange text-sv-orange font-medium hover:bg-sv-orange hover:text-white transition"
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-6 mt-4 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <span>⭐</span> <span>4.9/5 Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span> <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎁</span> <span>Premium Wrapping</span>
              </div>
            </div>
          </motion.div>

          {/* HERO IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img
              src="/hero/hero.jpg"
              alt="Gift Hero Visual"
              className="rounded-xl shadow-strong"
              onError={(e) => (e.target.src = "/placeholders/product.png")}
            />
          </motion.div>
        </section>

        {/* =============================================================== */}
        {/* BESTSELLERS SECTION */}
        {/* =============================================================== */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-heading text-sv-purple mb-8 text-center">
              Popular Picks Today
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestsellers.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="card card-hover overflow-hidden rounded-xl bg-white shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-56 object-cover"
                    onError={(e) => (e.target.src = "/placeholders/product.png")}
                  />

                  <div className="p-4">
                    <h3 className="font-medium text-sv-purple line-clamp-2">{item.name}</h3>
                    <p className="text-sv-orange font-bold mt-1">₹{item.price}</p>

                    <Link
                      to="/products"
                      className="inline-block mt-3 text-sm bg-sv-orange text-white px-4 py-2 rounded-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* CATEGORY HIGHLIGHTS */}
        {/* =============================================================== */}
        <section className="py-16 bg-pink-50/40">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-heading text-sv-purple text-center mb-12">
              Shop by Category
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

              <CategoryCard
                title="Party & Return Gifts"
                desc="Handpicked gifts that kids love — made fun, colorful, and memorable!"
                image="/categories/placeholder.png"
                link="/products"
              />

              <CategoryCard
                title="Corporate Gifting"
                desc="Premium hampers customized for teams, events, and client appreciation."
                image="/categories/placeholder.png"
                link="/products"
              />

              <CategoryCard
                title="Festive Hampers"
                desc="Seasonal goodies — Diwali, Christmas, New Year, Pongal & more."
                image="/categories/placeholder.png"
                link="/products"
              />
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* HOW IT WORKS */}
        {/* =============================================================== */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-heading text-sv-purple text-center mb-14">
              How SurpriseVista Works
            </h2>

            <div className="grid md:grid-cols-4 gap-8 text-center">

              <Step num="1" title="Choose Your Gift" desc="Browse curated collections for every age & event." />
              <Step num="2" title="Customize It" desc="Add names, messages, photos or special requests." />
              <Step num="3" title="Beautiful Packing" desc="Every order is wrapped with love & care." />
              <Step num="4" title="Fast Delivery" desc="Delivered quick across India with tracking updates." />

            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* TESTIMONIALS */}
        {/* =============================================================== */}
        <section className="py-20 bg-pink-50/40">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-heading text-sv-purple text-center mb-14">
              Loved by Our Customers ❤️
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

              <Testimonial
                quote="Absolutely loved the hamper! The wrap, the fragrance, everything felt premium."
                name="Aditi"
                image="/testimonials/user1.png"
              />
              <Testimonial
                quote="Ordered return gifts for my daughter’s birthday — kids were thrilled!"
                name="Rohan"
                image="/testimonials/user2.png"
              />
              <Testimonial
                quote="Perfect corporate gifting partner for our team events. Fast service!"
                name="Sneha"
                image="/testimonials/user3.png"
              />

            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* SOCIAL MEDIA SECTION */}
        {/* =============================================================== */}
        <section className="py-16 bg-white text-center">
          <h2 className="text-3xl font-heading text-sv-purple mb-4">Follow Our Journey</h2>
          <p className="text-gray-600 mb-6">Stay updated with new launches, offers & gifting ideas.</p>

          <div className="flex justify-center gap-6 text-3xl text-sv-purple">
            <a href="#" className="hover:text-sv-orange transition">📸</a>
            <a href="#" className="hover:text-sv-orange transition">📘</a>
            <a href="#" className="hover:text-sv-orange transition">▶️</a>
            <a href="#" className="hover:text-sv-orange transition">💬</a>
          </div>
        </section>

        {/* =============================================================== */}
        {/* FOOTER */}
        {/* =============================================================== */}
      

      </div>
    </PageTransition>
  );
}

/* ---------------------------------------------------------------- */
/* MINI COMPONENTS */
/* ---------------------------------------------------------------- */
function CategoryCard({ title, desc, image, link }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="card card-hover overflow-hidden rounded-xl bg-white shadow-soft"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
        onError={(e) => (e.target.src = "/placeholders/product.png")}
      />
      <div className="p-5">
        <h3 className="font-heading text-sv-purple text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{desc}</p>

        <Link
          to={link}
          className="inline-block mt-4 text-sm bg-sv-orange text-white px-4 py-2 rounded-lg"
        >
          Explore
        </Link>
      </div>
    </motion.div>
  );
}

function Step({ num, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-soft"
    >
      <div className="text-sv-orange text-3xl font-bold mb-2">{num}</div>
      <h4 className="font-heading text-lg text-sv-purple">{title}</h4>
      <p className="text-gray-600 text-sm mt-2">{desc}</p>
    </motion.div>
  );
}

function Testimonial({ quote, name, image }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-soft"
    >
      <img
        src={image}
        alt={name}
        className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
        onError={(e) => (e.target.src = "/testimonials/default.png")}
      />
      <p className="text-gray-700 italic text-center">“{quote}”</p>
      <p className="text-sv-purple font-semibold mt-3 text-center">— {name}</p>
    </motion.div>
  );
}



