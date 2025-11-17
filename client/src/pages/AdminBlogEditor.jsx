// client/src/pages/AdminBlogEditor.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AdminBlogEditor() {
  const { id } = useParams();
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  const quillRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    published: true,
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    // load all posts for admin list and optionally prefill edit
    fetch(`${API_URL}/api/blogs/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAllPosts(Array.isArray(data) ? data : []);
        if (id) {
          const p = data.find((x) => x._id === id);
          if (p) {
            setForm({
              title: p.title,
              excerpt: p.excerpt,
              content: p.content,
              tags: p.tags?.join(", ") || "",
              published: p.published,
            });
            setExistingImage(p.coverImage);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Quill image handler - opens file dialog and uploads
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("image", file);

      try {
        const res = await fetch(`${API_URL}/api/blogs/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        const imageUrl = `${API_URL}${data.url}`; // full absolute URL
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, "image", imageUrl);
        editor.setSelection(range.index + 1);
      } catch (err) {
        console.error("quill upload error:", err);
        alert("Image upload failed");
      }
    };
  };

  // attach modules with custom image handler
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        [{ align: [] }],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("coverImage", file);

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/api/blogs/${id}` : `${API_URL}/api/blogs`;

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }
      alert(id ? "Updated!" : "Created!");
      navigate("/admin/blogs");
    } catch (err) {
      console.error(err);
      alert("Save failed: " + err.message);
    }
  }

  async function deletePost(deleteId) {
    if (!window.confirm("Delete?")) return;
    await fetch(`${API_URL}/api/blogs/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  }

  return (
    <main className="pt-28 max-w-5xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-6"> {id ? "Edit Blog" : "Create Blog"} </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
        <input
          className="border p-3 w-full mb-4 rounded"
          placeholder="Title"
          value={form.title}
          required
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="border p-3 w-full mb-4 rounded"
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={form.content}
          onChange={(val) => setForm({ ...form, content: val })}
          modules={modules}
          className="mb-4"
        />

        {existingImage && <img src={`${API_URL}${existingImage}`} alt="" className="h-32 mb-3 object-cover rounded" />}

        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-3" />

        <input
          className="border p-3 w-full mb-3 rounded"
          placeholder="tags, comma separated"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published
        </label>

        <button className="bg-sv-orange text-white px-6 py-2 rounded">{id ? "Update" : "Create"}</button>
      </form>

      <h2 className="text-2xl font-bold mb-4">All Posts</h2>
      <div className="space-y-3">
        {allPosts.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-gray-500">{p.slug} • {new Date(p.publishedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/admin/blogs/edit/${p._id}`)} className="px-3 py-1 bg-blue-500 text-white rounded">Edit</button>
              <button onClick={() => deletePost(p._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
