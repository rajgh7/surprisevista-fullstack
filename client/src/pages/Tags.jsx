// client/src/pages/Tags.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

export default function Tags() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/blogs/meta/tags`)
      .then((r) => r.json())
      .then(setTags)
      .catch((err) => console.error(err));
  }, []);

  return (
    <main className="pt-28 max-w-4xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-6">Tags</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((t) => (
          <Link key={t.tag} to={`/tags/${encodeURIComponent(t.tag)}`} className="px-3 py-2 bg-white rounded shadow">
            {t.tag} <span className="text-gray-500">({t.count})</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
