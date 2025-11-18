import express from "express";
import Order from "../models/Order.js";
import { Resend } from "resend";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Disable WhatsApp for now
const WHATSAPP_ENABLED = false;

/* ----------------------------------------------------
   OPTIONAL RAZORPAY (DISABLED IF NO API KEYS)
---------------------------------------------------- */
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = (await import("razorpay")).default;
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("🟢 Razorpay Enabled");
} else {
  console.log("⚠️ Razorpay Disabled — No API Keys Found");
}

/* ----------------------------------------------------
   SAFELY DISABLED RAZORPAY ORDER ENDPOINT
---------------------------------------------------- */
router.post("/create-razorpay-order", async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: "Razorpay is disabled" });
  }

  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `SV_${Date.now()}`,
    });

    res.json(order);
  } catch (error) {
    console.error("❌ Razorpay Error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

/* ----------------------------------------------------
   WHATSAPP NOTIFICATION (DISABLED)
---------------------------------------------------- */
async function sendWhatsApp(orderCode, name, phone, total) {
  if (!WHATSAPP_ENABLED) {
    console.log("📵 WhatsApp Disabled — Skipping message...");
    return;
  }

  // Future WhatsApp API code will go here
}

/* ----------------------------------------------------
   PLACE ORDER (COD)
---------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      items,
      total,
      paymentMethod,
      orderCode,
      razorpayDetails,
    } = req.body;

    if (!name || !email || !address || !items || !items.length) {
      return res.status(400).json({ message: "Missing order details" });
    }

    /* FIX: REMOVE _id from items */
    const cleanedItems = items.map(item => {
      const { _id, ...rest } = item;
      return rest;
    });

    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items: cleanedItems,
      total,
      paymentMethod: paymentMethod || "COD",
      orderCode,
      razorpayDetails: razorpayDetails || null,
      createdAt: new Date(),
    });

    // EMAIL NOTIFICATIONS
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: process.env.MAIL_TO,
      subject: `🛍️ New Order — ${orderCode}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order Code:</strong> ${orderCode}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Total:</strong> ₹${total}</p>
      `,
    });

    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: email,
      subject: `🎉 Your Order ${orderCode} is Confirmed`,
      html: `
        <h3>Thank you, ${name}!</h3>
        <p>Your order <strong>${orderCode}</strong> has been received.</p>
        <p>We will contact you shortly.</p>
      `,
    });

    // WhatsApp disabled
    // sendWhatsApp(orderCode, name, phone, total);

    console.log("📵 WhatsApp skipped.");

    return res.status(201).json({
      message: "Order placed",
      orderId: order._id,
      orderCode,
    });

  } catch (error) {
    console.error("🔥 Order Error:", error);
    res.status(500).json({ message: "Order failed", error: error.message });
  }
});

export default router;
