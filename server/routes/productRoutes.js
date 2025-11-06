import express from "express";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper: compute selling price
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
  // fallback
  return m > 0 ? m : 0;
}

/* GET all */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    if (!products.length) {
      // fallback demo data (keeps response shape)
      const fallback = [];
      const categories = ["Party", "Corporate", "Retail"];
      const imgs = [
        "images/prod1.jpg",
        "images/prod2.jpg",
        "images/prod3.jpg",
        "images/prod4.jpg",
        "images/prod5.jpg",
        "images/prod6.jpg",
      ];
      for (let i = 1; i <= 30; i++) {
        const cat = categories[i % categories.length];
        fallback.push({
          _id: `demo-${i}`,
          name: `${cat} Gift ${i}`,
          category: cat,
          mrp: 499 + (i * 10),
          discount: i % 4 === 0 ? 10 : 0,
          price: Math.round((499 + (i * 10)) * (1 - ((i % 4 === 0 ? 10 : 0) / 100))),
          image: imgs[i % imgs.length],
          gallery: imgs,
          description: `Demo ${cat.toLowerCase()} gift.`,
          isOnSale: i % 4 === 0,
        });
      }
      return res.json(fallback);
    }
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* POST - create product (admin) */
router.post("/", verifyToken, async (req, res) => {
  try {
    const body = req.body || {};
    const mrp = body.mrp || 0;
    const discount = body.discount || 0;
    const explicitPrice = body.price;
    const price = computePrice(mrp, discount, explicitPrice);

    const newProduct = new Product({
      ...body,
      mrp,
      discount,
      price,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(400).json({ message: "Invalid product data" });
  }
});

/* PUT - update product (admin) */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    // compute price if necessary
    const mrp = body.mrp != null ? body.mrp : undefined;
    const discount = body.discount != null ? body.discount : undefined;
    const explicitPrice = body.price != null ? body.price : undefined;

    let product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // assign fields
    if (body.name != null) product.name = body.name;
    if (body.category != null) product.category = body.category;
    if (body.description != null) product.description = body.description;
    if (body.image != null) product.image = body.image;
    if (body.gallery != null) product.gallery = body.gallery;
    if (body.sku != null) product.sku = body.sku;
    if (body.stock != null) product.stock = body.stock;
    if (mrp !== undefined) product.mrp = Number(mrp);
    if (discount !== undefined) product.discount = Number(discount);
    if (body.isOnSale != null) product.isOnSale = Boolean(body.isOnSale);

    // determine price:
    // priority: explicitPrice (if provided), else compute from mrp & discount, else leave existing
    if (explicitPrice !== undefined) {
      product.price = Number(explicitPrice);
    } else if (mrp !== undefined || discount !== undefined) {
      product.price = computePrice(product.mrp, product.discount, product.price);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

/* DELETE - delete product (admin) */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
