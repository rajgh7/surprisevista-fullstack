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
  if (explicitPrice != null && explicitPrice !== "") {
    return Number(explicitPrice);
  }
  if (m > 0 && d > 0) {
    const p = Math.round(m * (1 - d / 100));
    return p > 0 ? p : 0;
  }
  return m > 0 ? m : 0;
}

/* =====================================================
   📦 GET ALL PRODUCTS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    if (!products.length) {
      // Demo fallback (if DB empty)
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
    const body = req.body || {};
    const mrp = Number(body.mrp) || 0;
    const discount = Number(body.discount) || 0;
    const price = computePrice(mrp, discount, body.price);

    const product = new Product({
      ...body,
      mrp,
      discount,
      price,
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

    // Try to find product by ObjectId or fallback
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ _id: id }).catch(() => null);
    }

    if (!product) {
      console.warn(`⚠️ Product not found: ${id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    // Compute new price
    const mrp = body.mrp != null ? Number(body.mrp) : product.mrp;
    const discount = body.discount != null ? Number(body.discount) : product.discount;
    const price = computePrice(mrp, discount, body.price);

    // Merge updates
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
      deleted = await Product.findOneAndDelete({ _id: id }).catch(() => null);
    }

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
