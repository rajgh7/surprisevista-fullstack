// server.js
import dotenv from "dotenv";
dotenv.config();
console.log("DEBUG:", "RESEND_API_KEY =", process.env.RESEND_API_KEY);

import path from "path";
import express from "express";
import mongoose from "mongoose";

// ROUTES (existing)
import productRoutes from "./routes/productRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

// NEW AI ROUTES
import chatbotRoute from "./routes/chatbot.js";
import testModels from "./routes/testModels.js";
import cartApi from "./routes/cartApi.js";
import adminAi from "./routes/adminAi.js";

import Blog from "./models/Blog.js";

const app = express();

/* ============================================================
   STATIC - UPLOADS
============================================================ */
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

/* ============================================================
   CORS CONFIG
============================================================ */
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
   JSON PARSING
============================================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================================================
   MONGODB CONNECT
============================================================ */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "surprisevista",

