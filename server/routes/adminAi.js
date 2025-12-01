// server/routes/adminAi.js
import express from "express";
import Product from "../models/Product.js";
import { generateFromGemini } from "../services/geminiClient.js";

const router = express.Router();

router.post("/ai/generate-desc", async (req, res) => {
  try {
    const { productId } = req.body;

    const p = await Product.findById(productId).lean();
    if (!p) return res.json({ error: "not_found" });

    const prompt = `Write SEO description + 5 bullets + meta description for:
Title: ${p.title}
Price: ${p.price}
Tags: ${p.tags}`;

    const ai = await generateFromGemini(prompt);

    return res.json({ ai });
  } catch (err) {
    return res.json({ error: err.message });
  }
});

export default router;
