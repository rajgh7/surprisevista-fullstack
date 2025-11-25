// server/routes/whatsappSendRoutes.js
import express from "express";
import Order from "../models/Order.js";
import { sendTemplate } from "../services/whatsappService.js";

const router = express.Router();

/**
 * POST /api/whatsapp/send-order
 * Body: { to: "<phone>", orderId: "<mongoOrderId>" }
 * Sends a template message 'order_update' with one variable: order code ({{1}})
 */
router.post("/send-order", async (req, res) => {
  try {
    const { to, orderId } = req.body;

    if (!to) return res.status(400).json({ error: "Customer phone number missing (to)" });
    if (!orderId) return res.status(400).json({ error: "orderId missing" });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Make sure we send the single variable expected by your approved template:
    // Template 'order_update' expects 1 variable: order code -> {{1}}
    const orderCode = order.orderCode || order._id.toString();

    await sendTemplate(to, "order_update", [
      {
        type: "body",
        parameters: [
          { type: "text", text: orderCode }
        ]
      }
    ]);

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ WhatsApp Send Error:", err);
    return res.status(500).json({ error: err.message || "WhatsApp send failed" });
  }
});

export default router;
