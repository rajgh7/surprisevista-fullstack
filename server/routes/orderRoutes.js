// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/* =====================================================
   🧩 EMAIL TRANSPORTER CONFIG (for order notifications)
===================================================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   🧩 FRONTEND: Create a New Order (Customer Checkout)
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    // Basic validation
    if (!name || !email || !address || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Missing required order details" });
    }

    // Save order to MongoDB
    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items,
      total,
    });

    /* ================================
       Send confirmation email (async)
    ================================= */
    const itemList = items
      .map((i) => `• ${i.name} — ₹${i.price} × ${i.qty || 1}`)
      .join("\n");

    const emailBody = `
Hi ${name},

Thank you for your order with SurpriseVista! 🎁

🧾 Order Summary:
${itemList}

Total Amount: ₹${total}

📦 Shipping Address:
${address}

We’ll reach out soon with your delivery details.
For any queries, please contact us at ${process.env.ADMIN_EMAIL}.

With love,
Team SurpriseVista
`;

    // Send to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your SurpriseVista Order Confirmation — ₹${total}`,
      text: emailBody,
    });

    // Notify admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🆕 New Order from ${name}`,
      text: `A new order has been placed!\n\n${emailBody}`,
    });

    console.log(`✅ Order confirmation email sent to ${email}`);

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/* =====================================================
   🧩 ADMIN: Get All Orders (Protected Route)
===================================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =====================================================
   🧩 ADMIN: Delete an Order (Optional)
===================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Delete order error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;
