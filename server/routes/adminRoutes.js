import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });

    // Create initial admin if not found
    if (!admin && email === process.env.ADMIN_EMAIL) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      admin = await Admin.create({ email, password: hashedPassword });
      console.log("✅ Default admin created");
    }

    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Example protected route
router.get("/profile", protect, async (req, res) => {
  const admin = await Admin.findById(req.admin).select("-password");
  res.json(admin);
});

export default router;
