// server.js

import path from "path";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import Blog from "./models/Blog.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();
const app = express();

// Serve uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

/* ============================================================
   🌐 CORS CONFIG
============================================================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://rajgh7.github.io",
  "https://rajgh7.github.io/surprisevista-fullstack",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.startsWith("https://rajgh7.github.io");

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else {
    console.warn("🚫 CORS blocked:", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ============================================================
   🧩 JSON / URL Parsing
============================================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================================================
   🧩 MongoDB Connection
============================================================= */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "surprisevista",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ============================================================
   🧩 SITEMAP ROUTE
============================================================= */
app.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Blog.find({ published: true }).sort({ publishedAt: -1 }).select("slug publishedAt updatedAt");
    const baseUrl = process.env.BASE_URL;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;

    posts.forEach((p) => {
      xml += `<url>
                <loc>${baseUrl}/blog/${p.slug}</loc>
                <lastmod>${(p.updatedAt || p.publishedAt).toISOString()}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.7</priority>
              </url>\n`;
    });

    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("sitemap error:", err);
    res.status(500).send("Sitemap error");
  }
});

/* ============================================================
   🧩 MAIN ROUTES
============================================================= */
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 SurpriseVista Backend Running");
});

/* ============================================================
   🧩 ERROR HANDLER
============================================================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ============================================================
   🚀 START SERVER
============================================================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
