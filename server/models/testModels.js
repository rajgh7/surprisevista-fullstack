import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/listmodels", async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );

    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.json({ error: e.message });
  }
});

export default router;
