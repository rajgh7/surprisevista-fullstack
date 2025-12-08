// server/server.js
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Existing routes
import productRoutes from "./routes/productRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

// NEW AI routes
import chatbotRoute from "./routes/chatbot.js";
import cartApi from "./routes/cartApi.js";
import adminAi from "./routes/adminAi.js";
import testModels from "./routes/testModels.js";

import Blog from "./models/Blog.js";

const app = express();

/* ============================================================
   CORS FIX — FULL SUPPORT FOR VERCEL DEPLOYMENT
============================================================ */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://surprisevista-fullstack.vercel.app",   // ✅ your frontend domain
  process.env.FRONTEND_URL                        // optional
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

// Fix preflight issues
app.options("*", cors());

/* ============================================================
   STATIC FILES
============================================================ */
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

/* ============================================================
   BODY PARSERS
============================================================ */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/* ============================================================
   MONGO DATABASE
============================================================ */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "surprisevista",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

/* ============================================================
   SITEMAP
============================================================ */
app.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Blog.find({ published: true })
      .sort({ publishedAt: -1 })
      .select("slug publishedAt updatedAt");

    const baseUrl = process.env.BASE_URL || "https://surprisevista.com";

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
    console.error("Sitemap Error:", err);
    res.status(500).send("Error");
  }
});

/* ============================================================
   MAIN ROUTES
============================================================ */
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);

/* ============================================================
   AI ROUTES
============================================================ */
app.use("/api/chatbot", chatbotRoute);
app.use("/api/cart", cartApi);
app.use("/api/admin/ai", adminAi);
app.use("/api", testModels);

/* ============================================================
   ROOT CHECK
============================================================ */
app.get("/", (req, res) => {
  res.send("🚀 SurpriseVista Backend Running");
});

/* ============================================================
   ERROR HANDLER
============================================================ */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

/* ============================================================
   START SERVER
============================================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
