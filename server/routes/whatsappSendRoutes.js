import express from "express";
import Order from "../models/Order.js";
import { sendText } from "../services/whatsappService.js";

const router = express.Router();

/**
 * Sends WhatsApp confirmation message AFTER order is created
 */
router.post("/send-order", async (req, res) => {
  try {
    const { to, orderId } = req.body;

    if (!to) return res.status(400).json({ error: "Customer phone number missing" });
    if (!orderId) return res.status(400).json({ error: "Order ID missing" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const itemsText = order.items
      .map((i) => `• ${i.name} x${i.qty} — ₹${i.price}`)
      .join("\n");

    const message = `🎁 *Thank you for your order!*  
🧾 *Order ID:* ${order.orderCode}

${itemsText}

💰 *Total:* ₹${order.total}

📍 *Delivery Address:*  
${order.address}

We will contact you shortly 😊`;

    await sendText(to, message);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ WhatsApp Send Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
