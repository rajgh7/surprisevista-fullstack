// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/orders  (create order from frontend)
router.post("/", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    // TODO: send email notification to admin
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});

// GET /api/orders (protected) - admin view
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
