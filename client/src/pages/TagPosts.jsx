// client/src/pages/TagPosts.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL } from "../config";

export default function TagPosts() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/blogs/by-tag/${encodeURIComponent(tag)}`)
      .then((r) => r.json())
      .then(setPosts)
      .catch((err) => console.error(err));
  }, [tag]);

  return (
    <main className="pt-28 max-w-6xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-6">Posts tagged: {tag}</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <article key={p._id} className="bg-white p-4 rounded shadow">
            <img src={`${API_URL}${p.coverImage}`} className="h-36 w-full object-cover rounded mb-3" alt="" />
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-gray-600">{p.excerpt}</p>
            <Link to={`/blog/${p.slug}`} className="text-sv-orange mt-2 inline-block">Read →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
