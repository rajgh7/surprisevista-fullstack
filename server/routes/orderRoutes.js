import express from "express";
import Order from "../models/Order.js";
import { Resend } from "resend";
import Razorpay from "razorpay";
import fetch from "node-fetch"; // for WhatsApp API
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ---------------------------------------
// 1) RAZORPAY INSTANCE
// ---------------------------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------
// 2) CREATE RAZORPAY ORDER (frontend calls this)
// ---------------------------------------
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) return res.status(400).json({ message: "Amount required" });

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: `SV_${Date.now()}`,
    });

    res.json(order);
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

// ---------------------------------------
// 3) SEND WHATSAPP MESSAGE (Admin Notification)
// ---------------------------------------
async function sendWhatsApp(orderCode, name, phone, total) {
  try {
    const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: process.env.WHATSAPP_TO,
      type: "text",
      text: {
        body: `🛍️ *New Order Received*\n\nOrder Code: ${orderCode}\nCustomer: ${name}\nPhone: ${phone}\nTotal: ₹${total}`,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📩 WhatsApp Response:", data);
  } catch (err) {
    console.error("❌ WhatsApp error:", err.message);
  }
}

// ---------------------------------------
// 4) PLACE ORDER (COD + Online Payment)
// ---------------------------------------
router.post("/", async (req, res) => {
  console.log("📥 Incoming Order:", req.body);

  try {
    const { name, email, phone, address, items, total, paymentMethod, orderCode, razorpayDetails } =
      req.body;

    if (!name || !email || !address || !items || !items.length) {
      return res.status(400).json({ message: "Missing order details" });
    }

    // Save to MongoDB
    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items,
      total,
      paymentMethod,
      orderCode,
      razorpayDetails: razorpayDetails || null,
      createdAt: new Date(),
    });

    // ---------------------------------------
    // 🌟 SEND EMAILS (ADMIN + CUSTOMER)
    // ---------------------------------------
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Admin Email
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

    // Customer Email
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: email,
      subject: `🎉 Your Order ${orderCode} is Confirmed`,
      html: `
        <h3>Thank you for your order, ${name}!</h3>
        <p>Your order code is <strong>${orderCode}</strong>.</p>
        <p>We will contact you shortly for delivery details.</p>
      `,
    });

    // ---------------------------------------
    // 🌟 SEND WHATSAPP NOTIFICATION
    // ---------------------------------------
    sendWhatsApp(orderCode, name, phone, total);

    res.status(201).json({ message: "Order placed", orderId: order._id, orderCode });

  } catch (error) {
    console.log("🔥 Order Error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
});

export default router;
