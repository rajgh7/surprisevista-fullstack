import express from "express";
import Order from "../models/Order.js";
import { sendTemplate } from "../services/whatsappService.js";

const router = express.Router();

router.post("/send-order", async (req, res) => {
  try {
    const { to, orderId } = req.body;

    if (!to) return res.status(400).json({ error: "Customer phone number missing" });
    if (!orderId) return res.status(400).json({ error: "Order ID missing" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Build template parameters
    const itemsText = order.items
      .map((i) => `${i.name} x${i.qty} — ₹${i.price}`)
      .join(", ");

      await sendTemplate(to, "hello_world", [
  {
    type: "body",
    parameters: [
      { type: "text", text: order.orderCode }
    ]
  }
]);


    res.json({ success: true });
  } catch (err) {
    console.error("❌ WhatsApp Send Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
