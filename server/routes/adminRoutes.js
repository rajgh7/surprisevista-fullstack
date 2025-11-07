import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Login route (simple env-based)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate credentials (from .env or hardcoded admin)
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// Optional: verify token
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, email: decoded.email });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
