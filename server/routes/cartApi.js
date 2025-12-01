// server/routes/cartApi.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    if (!productId) return res.json({ error: "productId required" });

    const p = await Product.findById(productId).lean();
    if (!p) return res.json({ error: "not_found" });

    return res.json({
      ok: true,
      added: {
        productId,
        qty,
        title: p.title,
        price: p.price
      }
    });
  } catch (err) {
    console.error("cart add error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
