// server/routes/chatbot.js
import express from "express";
import ChatSession from "../models/ChatSession.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { generateFromGemini } from "../services/geminiClient.js";
import {
  parseShoppingIntent,
  searchProductsByIntent,
} from "../services/recommendService.js";

const router = express.Router();

// SYSTEM INSTRUCTION for Gemini – forces ecommerce behavior
const SYSTEM_PROMPT = `
You are SurpriseVista AI Shopping Assistant.

RULES:
- NEVER invent products.
- When listing products, ONLY use products provided in the context.
- When user says "first one", "2nd option", "third", etc., refer to the last product list you generated.
- Keep answers short, simple, helpful.
- If user asks for “add to cart”, always confirm which product.
- If user already selected a product, add it directly.
- For address, payment, order-taking: collect details step-by-step.
- NEVER talk poetically. NO creative fiction. NO imaginary items.
- You only help with: gifts, products, orders, cart, messages.
`;

// helper to show real products
function formatProducts(products) {
  return products
    .map(
      (p, i) => `${i + 1}. ${p.title} – ₹${p.price} (ID: ${p._id})`
    )
    .join("\n");
}

router.post("/ask", async (req, res) => {
  try {
    const { message, sessionId: sId } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const sessionId = sId || `sess_${Date.now()}`;

    let session = await ChatSession.findOne({ sessionId });
    if (!session)
      session = await ChatSession.create({
        sessionId,
        messages: [],
        lastProducts: [],
        selectedProduct: null,
        orderStage: null,
        orderData: {},
      });

    session.messages.push({ role: "user", text: message });

    // 1) DETECT IF USER WANTS PRODUCT LIST
    if (/\b(list|show|get)\b.*\b(products|gifts)\b/i.test(message)) {
      const all = await Product.find().limit(8).lean();
      const reply = `Here are some products:\n\n${formatProducts(all)}\n\nTell me like "select 1" or "add first one to cart".`;
      session.lastProducts = all;
      await session.save();
      return res.json({ reply, sessionId, products: all });
    }

    // 2) SELECTING by number (first, second, 3rd, option 2)
    let selectedIndex = null;

    const numberWords = {
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
      fifth: 5,
    };
    for (const w in numberWords) {
      if (message.toLowerCase().includes(w)) {
        selectedIndex = numberWords[w] - 1;
      }
    }

    const numberMatch = message.match(/(\d+)(st|nd|rd|th)?/);
    if (numberMatch && selectedIndex === null) {
      selectedIndex = parseInt(numberMatch[1]) - 1;
    }

    if (
      selectedIndex !== null &&
      session.lastProducts &&
      session.lastProducts[selectedIndex]
    ) {
      const chosen = session.lastProducts[selectedIndex];
      session.selectedProduct = chosen;
      await session.save();

      const reply = `You selected: ${chosen.title} (₹${chosen.price}). Say "add to cart" to continue.`;
      return res.json({ reply, sessionId });
    }

    // 3) ADD TO CART REQUEST
    if (/\badd\b.*\b(cart)\b/i.test(message)) {
      if (!session.selectedProduct)
        return res.json({
          reply: "Which product should I add? Say: select 1 or select first.",
          sessionId,
        });

      const p = session.selectedProduct;
      const reply = `Added ${p.title} (₹${p.price}) to your cart! Want to proceed to order? Say "checkout".`;

      await session.save();
      return res.json({ reply, sessionId });
    }

    // 4) CHECKOUT FLOW
    if (/\b(checkout|place order|order)\b/i.test(message)) {
      session.orderStage = "ASK_ADDRESS";
      await session.save();
      return res.json({
        reply: "Great! Please provide your full shipping address.",
        sessionId,
      });
    }

    // 5) ADDRESS STAGE
    if (session.orderStage === "ASK_ADDRESS") {
      session.orderData.address = message;
      session.orderStage = "ASK_PAYMENT";
      await session.save();
      return res.json({
        reply: "Got it! What payment method do you prefer? (COD / UPI / card)",
        sessionId,
      });
    }

    // 6) PAYMENT STAGE
    if (session.orderStage === "ASK_PAYMENT") {
      session.orderData.payment = message;
      session.orderStage = "CONFIRM";
      await session.save();
      return res.json({
        reply: `Your order summary:\nProduct: ${session.selectedProduct?.title}\nAddress: ${session.orderData.address}\nPayment: ${session.orderData.payment}\n\nSay "confirm" to place order.`,
        sessionId,
      });
    }

    // 7) CONFIRM ORDER
    if (session.orderStage === "CONFIRM" && /\bconfirm\b/i.test(message)) {
      session.orderStage = null;
      await session.save();
      return res.json({
        reply: "🎉 Order placed successfully! You will receive an update shortly.",
        sessionId,
      });
    }

    // 8) GIFT SUGGESTIONS (intent-based)
    if (/\b(gift|suggest|recommend)\b/i.test(message)) {
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 8);
      session.lastProducts = products;

      const reply = `Here are some suggestions:\n${formatProducts(
        products
      )}\n\nSay like: select 1 or select second.`;

      await session.save();
      return res.json({ reply, sessionId, products });
    }

    // 9) DEFAULT AI FALLBACK — TUNED FOR ECOMMERCE  
    const prompt = `${SYSTEM_PROMPT}\nUser: ${message}`;
    let ai = await generateFromGemini(prompt);

    session.messages.push({ role: "bot", text: ai });
    await session.save();

    return res.json({ reply: ai, sessionId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
