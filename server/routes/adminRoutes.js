// routes/adminRoutes.js
import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // find admin
    let admin = await Admin.findOne({ email: email.toLowerCase() });

    // If admin not present, auto-create default admin from env (first deploy)
    if (!admin && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_EMAIL.toLowerCase() === email.toLowerCase()) {
      // create using env password
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      admin = await Admin.create({ email: email.toLowerCase(), password: hashed });
      console.log("Created default admin from ENV");
    }

    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
