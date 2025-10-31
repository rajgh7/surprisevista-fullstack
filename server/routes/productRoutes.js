// routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/products?limit=...&page=...
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 150;
  const page = parseInt(req.query.page) || 1;
  try {
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// POST /api/products (protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

export default router;
