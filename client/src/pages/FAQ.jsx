// client/src/pages/FAQ.jsx
import React, { useState } from "react";

const qa = [
  { q: "What is the delivery time?", a: "Typical delivery is 3-7 business days depending on location." },
  { q: "Do you offer bulk discounts?", a: "Yes — contact us via the bulk orders form for special pricing." },
  { q: "Can I customize a hamper?", a: "Absolutely. Use the contact form or message us on chat for custom requests." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl text-sv-purple font-heading mb-6">Frequently asked questions</h2>
        <div className="space-y-3">
          {qa.map((item, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <button className="w-full text-left flex justify-between items-center" onClick={() => setOpen(open === i ? null : i)}>
                <div className="font-medium">{item.q}</div>
                <div className="text-sv-orange">{open === i ? "−" : "+"}</div>
              </button>
              {open === i && <div className="mt-3 text-gray-600">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
