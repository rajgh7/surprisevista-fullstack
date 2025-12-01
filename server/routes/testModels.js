// server/routes/testModels.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/listmodels", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    const data = await r.json();
    return res.json(data);
  } catch (err) {
    return res.json({ error: err.message });
  }
});

export default router;
