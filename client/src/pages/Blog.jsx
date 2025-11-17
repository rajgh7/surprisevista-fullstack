// client/src/pages/Blog.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    loadTags();
    loadPosts();
  }, []);

  async function loadTags() {
    try {
      const res = await fetch(`${API_URL}/api/blogs/meta/tags`);
      const data = await res.json();
      setTags(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPosts(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/api/blogs?${qs}`);
      const json = await res.json();
      setPosts(json.posts || json || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (selectedTag) params.tag = selectedTag;
    loadPosts(params);
  }

  function clearFilters() {
    setSearch("");
    setSelectedTag("");
    loadPosts();
  }

  return (
    <main className="pt-28 max-w-6xl mx-auto px-6">
      <h1 className="text-4xl font-bold text-sv-purple mb-6 text-center">SurpriseVista Blog</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="border p-2 rounded w-full" />
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="border p-2 rounded">
          <option value="">All tags</option>
          {tags.map((t) => <option key={t.tag} value={t.tag}>{t.tag} ({t.count})</option>)}
        </select>
        <button className="bg-sv-orange text-white px-4 py-2 rounded">Search</button>
        <button type="button" onClick={clearFilters} className="px-3 border rounded">Clear</button>
      </form>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((p) => (
          <article key={p._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
            <img src={p.coverImage ? `${API_URL}${p.coverImage}` : `${API_URL}/uploads/placeholder.jpg`} alt="" className="h-48 w-full object-cover rounded mb-3" />
            <h2 className="text-xl font-semibold text-sv-purple">{p.title}</h2>
            <p className="text-gray-600 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: p.excerpt }} />
            <Link to={`/blog/${p.slug}`} className="text-sv-orange mt-3 inline-block">Read More →</Link>
            <div className="mt-3 text-xs text-gray-500">Tags: {p.tags?.join(", ")}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
