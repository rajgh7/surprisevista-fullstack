// server/routes/blogRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Blog from "../models/Blog.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure uploads directory exists inside server folder
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6 MB
});

/* ---------------- PUBLIC ROUTES ---------------- */

// GET /api/blogs?page=1&limit=12   -> paginated public list
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "12")));
    const skip = (page - 1) * limit;
    const filter = { published: true };

    // optional tag filter: /api/blogs?tag=party
    if (req.query.tag) filter.tags = req.query.tag;

    // optional search: /api/blogs?search=gift
    if (req.query.search) {
      const q = req.query.search;
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("blog list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/blogs/:slug   -> single published post
router.get("/:slug", async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, published: true }).select("-__v");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("get post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/blogs/tags   -> list all unique tags (public)
router.get("/meta/tags", async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { published: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1, tag: 1 } },
    ]);
    res.json(tags);
  } catch (err) {
    console.error("tags error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/blogs/by-tag/:tag  -> posts by tag
router.get("/by-tag/:tag", async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await Blog.find({ tags: tag, published: true }).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("by-tag error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/blogs/search?q=keyword
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json([]);
    const posts = await Blog.find({
      published: true,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    }).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------- RELATED ----------------- */
// GET /api/blogs/related/:id  -> find related posts by tags (limit 3)
router.get("/related/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const origin = await Blog.findById(id).select("tags");
    if (!origin) return res.json([]);
    const tags = origin.tags || [];
    if (tags.length === 0) return res.json([]);

    const related = await Blog.find({
      _id: { $ne: origin._id },
      published: true,
      tags: { $in: tags },
    })
      .limit(4)
      .sort({ publishedAt: -1 })
      .select("-__v");

    res.json(related);
  } catch (err) {
    console.error("related error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- ADMIN (protected) CRUD + Upload ----------------- */

// Admin: list all (including unpublished)
router.get("/admin/all", verifyToken, async (req, res) => {
  try {
    const posts = await Blog.find({}).sort({ createdAt: -1 }).select("-__v");
    res.json(posts);
  } catch (err) {
    console.error("admin list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: create
router.post("/", verifyToken, upload.single("coverImage"), async (req, res) => {
  try {
    const { title, excerpt, content, tags = "", published = true } = req.body;
    const tagsArr = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const blogData = {
      title,
      excerpt,
      content,
      tags: tagsArr,
      published: published === "true" || published === true,
    };

    if (req.file) blogData.coverImage = `/uploads/${req.file.filename}`;

    const newBlog = new Blog(blogData);
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error("create blog error:", err);
    res.status(500).json({ message: "Failed to create blog", error: err.message });
  }
});

// Admin: update
router.put("/:id", verifyToken, upload.single("coverImage"), async (req, res) => {
  try {
    const id = req.params.id;
    const { title, excerpt, content, tags = "", published = true } = req.body;
    const tagsArr = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const updateData = {
      title,
      excerpt,
      content,
      tags: tagsArr,
      published: published === "true" || published === true,
    };
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;

    const updated = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("update blog error:", err);
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
});

// Admin: delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Blog.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("delete blog error:", err);
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

/* ---------------- Quill image upload (for editor) ----------------
   POST /api/blogs/upload (protected) -> accepts single file 'image'
   returns { url: "/uploads/filename.jpg" }
*/
router.post("/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
