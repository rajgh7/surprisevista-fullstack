// backend/routes/chatbot.js
import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ChatSession from "../models/ChatSession.js";
import { generateFromGemini } from "../services/geminiClient.js";

const router = express.Router();

/**
 * Simple business context for the assistant.
 * Edit this to match your brand voice / policies.
 */
const BUSINESS_CONTEXT = `
You are Surprise Vista customer support assistant.
Tone: friendly, helpful, concise.
Scope: gifting, product recommendations, orders, shipping, returns, payments.
If user asks about an order, ask for order code if not provided.
When recommending, use products passed in SystemProducts array.
Always avoid giving legal/medical advice.
`;

/**
 * POST /api/chatbot/ask
 * Body: { sessionId?, userId?, message }
 */
router.post("/ask", async (req, res) => {
  try {
    const { sessionId: incomingSessionId, userId = null, message } = req.body;
    if (!message || !message.toString().trim()) return res.status(400).json({ error: "message required" });

    // 1) Session handling (create if missing)
    let session = null;
    const sessionId = incomingSessionId || `sess_${Date.now()}`; // simple session id if none provided
    session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, userId, messages: [] });
    }
    session.messages.push({ role: "user", text: message, ts: new Date() });
    await session.save();

    // 2) Quick order lookup heuristic: match order codes like SV1234 or ORDER123
    const orderMatch = message.match(/\b(SV|ORDER)?[-_ ]?([A-Za-z0-9]{4,})\b/i);
    if (orderMatch) {
      const possible = orderMatch[0];
      // try with orderCode field
      const order = await Order.findOne({ $or: [{ orderCode: possible }, { orderCode: possible.toUpperCase() }] });
      if (order) {
        const reply = `Order ${order.orderCode} is currently "${order.status || "pending"}". Expected delivery: ${order.expectedDelivery ? order.expectedDelivery.toDateString() : "N/A"}.`;
        session.messages.push({ role: "bot", text: reply, ts: new Date() });
        await session.save();
        return res.json({ reply, sessionId: session.sessionId });
      }
    }

    // 3) Product search for shopping queries (simple)
    // Perform a basic text search on name/description and return a small snippet for the prompt
    const q = message.trim();
    let products = [];
    try {
      products = await Product.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } }
        ],
      }).limit(6).lean();
    } catch (err) {
      // ignore search error and continue — we still want a generative reply
      console.warn("Product search error:", err.message);
      products = [];
    }

    const productSnippet = products.map(p => ({
      id: p._id?.toString?.() || null,
      name: p.name,
      price: p.price ?? p.mrp ?? null,
      category: p.category ?? null,
      stock: p.stock ?? null,
    }));

    // 4) Build the prompt for Gemini
    const prompt = `
${BUSINESS_CONTEXT}

SystemProducts: ${JSON.stringify(productSnippet)}

User: ${message}

Assistant:`;

    // 5) Call Gemini client
    let aiText = "";
    try {
      aiText = await generateFromGemini(prompt, { max_tokens: 400, temperature: 0.2 });
    } catch (err) {
      console.error("Gemini call failed:", err?.message || err);
      // graceful fallback text
      aiText = "Sorry — the AI assistant is temporarily unavailable. I can help with orders and product lookups. Please try again.";
    }

    // 6) Save bot response in session and return
    const reply = typeof aiText === "string" ? aiText : JSON.stringify(aiText);
    session.messages.push({ role: "bot", text: reply, ts: new Date() });
    await session.save();

    return res.json({ reply, sessionId: session.sessionId });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "server_error", details: err?.message });
  }
});

export default router;
