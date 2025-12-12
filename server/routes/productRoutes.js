import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   🧮 Helper: Compute Selling Price
===================================================== */
function computePrice(mrp, discount, explicitPrice) {
  const m = Number(mrp) || 0;
  const d = Number(discount) || 0;
  if (explicitPrice != null && explicitPrice !== "") return Number(explicitPrice);
  if (m > 0 && d > 0) return Math.round(m * (1 - d / 100));
  return m;
}

/* =====================================================
   📦 GET ALL PRODUCTS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    // Fallback demo data (if DB empty)
    if (!products.length) {
      const categories = ["Party", "Corporate", "Retail"];
      const imgs = [
        "images/prod1.jpg",
        "images/prod2.jpg",
        "images/prod3.jpg",
        "images/prod4.jpg",
        "images/prod5.jpg",
        "images/prod6.jpg",
      ];
      const demo = [];
      for (let i = 1; i <= 30; i++) {
        const cat = categories[i % categories.length];
        const mrp = 499 + i * 10;
        const discount = i % 4 === 0 ? 10 : 0;
        demo.push({
          _id: `demo-${i}`,
          name: `${cat} Gift ${i}`,
          category: cat,
          mrp,
          discount,
          price: computePrice(mrp, discount),
          image: imgs[i % imgs.length],
          gallery: imgs,
          description: `Demo ${cat.toLowerCase()} gift.`,
          isOnSale: i % 4 === 0,
        });
      }
      return res.json(demo);
    }

    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* =====================================================
   ➕ CREATE PRODUCT (Admin)
===================================================== */
router.post("/", verifyToken, async (req, res) => {
  try {
    const product = new Product({
  ...rest,
  mrp,
  discount,
  price: computePrice(mrp, discount, price),
  image: rest.image,     // already a CDN URL
  gallery: rest.gallery || []
});

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(400).json({ message: "Invalid product data", error: err.message });
  }
});

/* =====================================================
   ✏️ UPDATE PRODUCT (Admin)
===================================================== */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const mrp = Number(body.mrp ?? 0);
    const discount = Number(body.discount ?? 0);
    const price = computePrice(mrp, discount, body.price);

    let product = null;

    // 🧠 Case 1: Real Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    // 🧠 Case 2: Demo or invalid ID (e.g., demo-1)
    if (!product) {
      if (id.startsWith("demo-")) {
        console.log(`⚙️ Auto-creating new product for demo ID: ${id}`);
        const newProduct = new Product({
          name: body.name || `Converted ${id}`,
          category: body.category || "Retail",
          mrp,
          discount,
          price,
          image: body.image || "images/prod1.jpg",
          description: body.description || "Auto-created product from demo",
          isOnSale: body.isOnSale || false,
        });
        const saved = await newProduct.save();
        return res.status(201).json(saved);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    // 🧠 Case 3: Update existing product
    Object.assign(product, { ...body, mrp, discount, price });
    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

/* =====================================================
   ❌ DELETE PRODUCT (Admin)
===================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndDelete(id);
    }

    if (!deleted) {
      if (id.startsWith("demo-")) {
        // Don't actually delete demo data
        console.log(`⚠️ Tried to delete demo product ${id} — skipping.`);
        return res.json({ message: "Demo product not in database" });
      }
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
