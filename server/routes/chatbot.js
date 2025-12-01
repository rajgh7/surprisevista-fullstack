// server/routes/chatbot.js
import express from "express";
import ChatSession from "../models/ChatSession.js";
import Order from "../models/Order.js";
import { parseShoppingIntent, searchProductsByIntent } from "../services/recommendService.js";
import { generateFromGemini } from "../services/geminiClient.js";

const router = express.Router();

function formatProductsList(products) {
  if (!products || products.length === 0) return "No matching products found.";
  return products
    .map((p, i) => `${i + 1}. ${p.title} — ₹${p.price} (ID: ${p._id})`)
    .join("\n");
}

router.post("/ask", async (req, res) => {
  try {
    const { sessionId: incoming, userId = null, message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const sessionId = incoming || `sess_${Date.now()}`;
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({
        sessionId,
        userId,
        messages: []
      });
    }

    session.messages.push({ role: "user", text: message });
    await session.save();

    // Order tracking detection
    const orderMatch = message.match(/\b(SV|ORDER)?[-_ ]?([0-9A-Za-z]{4,})\b/);
    if (orderMatch && /\b(order|track|status|where)\b/i.test(message)) {
      const orderId = orderMatch[0].replace(/\s+/g, "");
      const order =
        (await Order.findOne({ orderId })) ||
        (await Order.findOne({ orderCode: orderId }));

      if (order) {
        const reply = `Order ${order.orderId || order.orderCode} status: ${
          order.status
        }. Items: ${order.items
          ?.map((it) => `${it.qty} x ${it.name || it.productId}`)
          .join(", ")}`;
        session.messages.push({ role: "bot", text: reply });
        await session.save();
        return res.json({ reply, sessionId });
      }
    }

    // Gift recommendations
    if (/\b(gift|suggest|recommend|ideas)\b/i.test(message)) {
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 8);

      const productText = formatProductsList(products);
      const prompt = `Recommend gifts based on these:\n${productText}\nUser asked: "${message}". Give 2-line summary.`;

      let aiText = await generateFromGemini(prompt);

      const reply = `${aiText}\n\n${productText}`;
      session.messages.push({ role: "bot", text: reply });
      await session.save();
      return res.json({ reply, sessionId, products });
    }

    // Greeting messages
    if (/\b(message|greeting|wish)\b/i.test(message)) {
      const prompt = `Write 3 greeting card messages for: "${message}".`;
      const aiText = await generateFromGemini(prompt);
      session.messages.push({ role: "bot", text: aiText });
      await session.save();
      return res.json({ reply: aiText, sessionId });
    }

    // WhatsApp share
    if (/\b(whatsapp|share)\b/i.test(message)) {
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 5);
      const list = products
        .map(
          (p, i) =>
            `${i + 1}. ${p.title} - ₹${p.price} - https://yourdomain.com/p/${p._id}`
        )
        .join("\n");

      const reply = `Here are some options:\n${list}`;
      session.messages.push({ role: "bot", text: reply });
      await session.save();
      return res.json({ reply, sessionId });
    }

    // Default AI response
    let aiText = await generateFromGemini(
      `You are SurpriseVista assistant. User: ${message}. Reply friendly.`
    );

    session.messages.push({ role: "bot", text: aiText });
    await session.save();

    return res.json({ reply: aiText, sessionId });
  } catch (err) {
    console.error("chatbot error:", err);
    return res.status(500).json({ error: "server_error", details: err.message });
  }
});

export default router;
