// server/routes/adminAi.js
import express from "express";
import { generateFromGemini } from "../services/geminiClient.js";
import Product from "../models/Product.js";

const router = express.Router();

// POST /api/admin/ai/generate-desc { productId }
router.post("/ai/generate-desc", async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const p = await Product.findById(productId).lean();
    if (!p) return res.status(404).json({ error: 'not_found' });

    const prompt = `Write a product description + 5 bullet points + meta description for this product.
Product: ${p.title}
Price: ${p.price}
Tags: ${p.tags?.join(", ") || ""}
Description: ${p.description || ""}

Tone: friendly, concise, SEO-friendly, CTA to buy.`;

    const ai = await generateFromGemini(prompt);
    return res.json({ ai });
  } catch (err) {
    console.error("admin ai err", err);
    return res.status(500).json({ error: 'server_error', details: err.message });
  }
});

export default router;
