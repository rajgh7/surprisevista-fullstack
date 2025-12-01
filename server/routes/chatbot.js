// server/routes/chatbot.js
import express from "express";
import ChatSession from "../models/ChatSession.js";
import Order from "../models/Order.js";
import { parseShoppingIntent, searchProductsByIntent } from "../services/recommendService.js";
import { generateFromGemini } from "../services/geminiClient.js";

const router = express.Router();

// helper formatter
function formatProductsList(products) {
  if (!products || products.length === 0) return "No matching products found.";
  return products.map((p, i) => `${i+1}. ${p.title} — ₹${p.price} (ID: ${p._id})`).join("\n");
}

/**
 POST /api/chatbot/ask
 body: { sessionId?, userId?, message }
*/
router.post("/ask", async (req, res) => {
  try {
    const { sessionId: incomingSessionId, userId=null, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    // session handling
    const sessionId = incomingSessionId || `sess_${Date.now()}`;
    let session = await ChatSession.findOne({ sessionId });
    if (!session) session = await ChatSession.create({ sessionId, userId, messages: [] });
    session.messages.push({ role: "user", text: message, ts: new Date() });
    await session.save();

    // 1) Order lookup (if message contains typical orderId patterns)
    const orderMatch = message.match(/\b(SV|ORDER|SV-)?[-_ ]?([A-Za-z0-9]{4,})\b/i);
    if (orderMatch && /\border|track|status|where\b/i.test(message)) {
      const possible = orderMatch[0].replace(/\s+/g,'');
      const order = await Order.findOne({ orderId: possible }) || await Order.findOne({ orderCode: possible });
      if (order) {
        const reply = `Order ${order.orderId||order.orderCode} status: ${order.status||'N/A'}. Expected delivery: ${order.expectedDelivery ? order.expectedDelivery.toDateString() : 'N/A'}. Items: ${order.items?.map(it => `${it.qty} x ${it.name||it.productId}`).join(", ")}`;
        session.messages.push({ role:'bot', text:reply, ts:new Date() });
        await session.save();
        return res.json({ reply, sessionId: session.sessionId });
      }
    }

    // 2) Add-to-cart command (simple)
    if (/\b(add|put)\b.*\b(cart|basket)\b/i.test(message) || /\badd\b.*\bqty|quantity|to cart\b/i.test(message)) {
      // Ask frontend/cart route to handle actual add; here we return intent
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 6);
      const reply = products.length ? `I found these products. Reply with "add 1" or "add ID <productId>" to add.` + "\n\n" + formatProductsList(products) : "I couldn't find matching products to add.";
      session.messages.push({ role:'bot', text:reply, ts:new Date() });
      await session.save();
      return res.json({ reply, sessionId: session.sessionId });
    }

    // 3) If user explicitly asks for recommendations / gift ideas
    if (/\b(gift|suggest|recommend|ideas|recommendation)\b/i.test(message)) {
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 8);
      const productText = formatProductsList(products);
      // also create a short AI-blurb using Gemini summarizer
      const prompt = `You are a friendly shopping assistant. Given these products:\n${productText}\nWrite a short, helpful recommendation for a user who asked: "${message}". Keep it to 2 short lines and include product numbers.`;
      let aiText = "";
      try {
        aiText = await generateFromGemini(prompt);
      } catch (err) {
        console.error("AI rec err", err);
        aiText = "Here are some options:";
      }
      const reply = `${aiText}\n\n${productText}`;
      session.messages.push({ role:'bot', text:reply, ts:new Date() });
      await session.save();
      return res.json({ reply, sessionId: session.sessionId, products });
    }

    // 4) Greeting card / message generation
    if (/\b(card|message|wish|greeting|note)\b/i.test(message) && /\b(write|generate|create|help)\b/i.test(message)) {
      const prompt = `Write 3 short greeting card messages for: "${message}". Provide tone variants: cute, sentimental, funny. Each message must be 1-2 lines.`;
      let aiText = await generateFromGemini(prompt);
      session.messages.push({ role:'bot', text: aiText, ts:new Date() });
      await session.save();
      return res.json({ reply: aiText, sessionId: session.sessionId });
    }

    // 5) WhatsApp share format
    if (/\b(whatsapp|share|send)\b/i.test(message) && /\b(product|gift|link)\b/i) {
      // Recommend short structured message
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 4);
      const list = products.map((p,i)=> `${i+1}. ${p.title} - ₹${p.price} - https://yourdomain.com/product/${p._id}`).join("\n");
      const whatsapp = `Hi! Here are some gifts I found:\n${list}\nPick one and I can add to cart for you.`;
      session.messages.push({ role:'bot', text: whatsapp, ts:new Date() });
      await session.save();
      return res.json({ reply: whatsapp, sessionId: session.sessionId });
    }

    // 6) Upsell detection (simple heuristics)
    if (/\b(buy|checkout|buy now|order)\b/i.test(message)) {
      // Suggest small add-ons
      const upsell = "Add a personalized greeting card (₹99) or premium wrapping (₹149) to make it special. Want me to add one?";
      session.messages.push({ role:'bot', text:upsell, ts:new Date() });
      await session.save();
      return res.json({ reply: upsell, sessionId: session.sessionId });
    }

    // 7) fallback: ask AI for Q/A
    let aiText = "";
    try {
      const contextPrompt = `You are SurpriseVista assistant. User: ${message}\nAnswer concisely, in a helpful tone. If you recommend products, ask for budget or occasion.`;
      aiText = await generateFromGemini(contextPrompt);
    } catch (err) {
      console.error("Gemini call failed:", err);
      aiText = "Sorry — the AI assistant is temporarily unavailable. I can help with orders and product lookups.";
    }

    session.messages.push({ role:'bot', text:aiText, ts:new Date() });
    await session.save();
    return res.json({ reply: aiText, sessionId: session.sessionId });

  } catch (err) {
    console.error("chatbot err", err);
    return res.status(500).json({ error: 'server_error', details: err.message });
  }
});

export default router;
