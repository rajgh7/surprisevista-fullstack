// server/routes/cartApi.js
import express from "express";
import Product from "../models/Product.js";
// Simplified cart handling: store in-memory per-session for demo.
// You should integrate with your real Cart model or session system.

const router = express.Router();

// POST /api/cart/add { sessionId?, userId?, productId, qty }
router.post("/add", async (req, res) => {
  try {
    const { sessionId, userId, productId, qty = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ error: 'product_not_found' });

    // For demonstration we'll return success and the product details
    // Replace with actual cart DB logic as needed.
    return res.json({ ok: true, added: { productId, qty, title: product.title, price: product.price } });
  } catch (err) {
    console.error("cart add err", err);
    return res.status(500).json({ error: 'server_error' });
  }
});

export default router;
