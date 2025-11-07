// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// ✅ Route Imports
import productRoutes from "./routes/productRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

const app = express();


/* ============================================================
   🧩 UNIVERSAL CORS CONFIG — Works for Local + Render + GitHub
============================================================= */
const allowedOrigins = [
  "http://localhost:5173",                // local dev
  "http://127.0.0.1:5173",                // alternate local
  "https://rajgh7.github.io/surprisevista-fullstack", // your GitHub Pages URL
  process.env.FRONTEND_URL,               // Render ENV variable (for flexibility)
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // 🧠 Add a log for Render debugging
  if (origin) console.log(`🌐 CORS origin: ${origin}`);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


/* ============================================================
   🧩 UNIVERSAL CORS CONFIG — Local + Render + GitHub Pages
============================================================= 
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://rajgh7.github.io/surprisevista-fullstack", // ✅ Replace with your real frontend repo
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // 🧠 Debug log to confirm origin in Render logs
  if (origin) console.log(`🌐 CORS Allowed Origin: ${origin}`);

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
}); */

// ✅ Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================================================
   🧩 DATABASE CONNECTION
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
   🧩 NODEMAILER SETUP
============================================================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ============================================================
   🧩 TEST ROUTES
============================================================= */
app.get("/api/test", (req, res) => res.send("✅ SurpriseVista API is Live!"));

app.get("/api/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "SurpriseVista Test Email",
      text: "Your email system is configured and working ✅",
    });
    res.send("✅ Email test sent successfully");
  } catch (err) {
    console.error("❌ Email test failed:", err);
    res.status(500).send("Email test failed");
  }
});

/* ============================================================
   🧩 MAIN ROUTES
============================================================= */
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 SurpriseVista Backend Running — All Systems Go!");
});

/* ============================================================
   🧩 ERROR HANDLER
============================================================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ============================================================
   🧩 START SERVER
============================================================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} — CORS fixed ✅`)
);
