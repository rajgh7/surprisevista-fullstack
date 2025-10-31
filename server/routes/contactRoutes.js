// routes/contactRoutes.js
import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Name, email and message required" });
  try {
    const contact = await Contact.create({ name, email, phone, message });
    // TODO: Optionally send email here (Nodemailer) or enqueue job
    res.status(201).json({ message: "Saved", contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save contact" });
  }
});

export default router;
