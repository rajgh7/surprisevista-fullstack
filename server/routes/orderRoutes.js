// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

/* =====================================================
   🧩 FRONTEND: Create a New Order (Customer Checkout)
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    if (!name || !email || !address || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Missing required order details" });
    }

    // Save order
    const order = await Order.create({ name, email, phone, address, items, total });

    // Format email body
    const itemList = items.map(i => `• ${i.name} — ₹${i.price} × ${i.qty || 1}`).join("<br/>");

    const adminHtml = `
      <h2>🆕 New Order from ${name}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong><br/>${address}</p>
      <h3>Items:</h3>
      <p>${itemList}</p>
      <p><strong>Total:</strong> ₹${total}</p>
    `;

    const customerHtml = `
      <p>Hi ${name},</p>
      <p>Thank you for your order with SurpriseVista! 🎁</p>
      <h3>Your Order Summary:</h3>
      <p>${itemList}</p>
      <p><strong>Total Amount:</strong> ₹${total}</p>
      <p>We will reach out with delivery details soon.</p>
      <p>Warm regards,<br/>Team SurpriseVista</p>
    `;

    // Send to Admin
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: process.env.MAIL_TO,
      subject: `🆕 New Order — ₹${total}`,
      html: adminHtml,
    });

    // Send auto-confirmation to Customer
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: email,
      subject: `🎁 Your SurpriseVista Order — ₹${total}`,
      html: customerHtml,
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error("❌ Order creation error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/* ADMIN: Get All Orders */
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ADMIN: Delete Order */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;
