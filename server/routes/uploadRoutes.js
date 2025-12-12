// server/routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { uploadToR2 } from "../services/cloudflare.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/product", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(req.file.originalname);
    const fileName = `product-${Date.now()}${ext}`;

    const url = await uploadToR2(req.file.buffer, fileName, req.file.mimetype);

    res.json({ ok: true, url });
  } catch (err) {
    console.error("R2 upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
