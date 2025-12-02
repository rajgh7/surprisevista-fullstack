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

// helper to format products for text context
function formatProducts(products) {
  return products
    .map((p, i) => `${i + 1}. ${p.title} – ₹${p.price} (ID: ${p._id})`)
    .join("\n");
}

function parseNumberIndicesFromText(message) {
  const indices = [];
  const numberWords = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
  for (const w in numberWords) {
    if (message.toLowerCase().includes(w)) {
      indices.push(numberWords[w] - 1);
    }
  }
  // numeric matches like "1 and 3" or "select 1,3"
  const nums = message.match(/\b(\d+)\b/g);
  if (nums) {
    nums.forEach((n) => {
      const idx = parseInt(n, 10) - 1;
      if (!indices.includes(idx)) indices.push(idx);
    });
  }
  return indices.filter((i) => i >= 0);
}

router.post("/ask", async (req, res) => {
  try {
    const { message, sessionId: sId } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const sessionId = sId || `sess_${Date.now()}`;
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({
        sessionId,
        messages: [],
        lastProducts: [],
        selectedProduct: null,
        orderStage: null,
        orderData: {},
      });
    }

    session.messages.push({ role: "user", text: message });

    // --- 1) track order flow: if user asks track
    if (/\b(track|where is my order|order status)\b/i.test(message)) {
      // check if message contains order id
      const ordMatch = message.match(/\b([A-Za-z0-9-_]{6,})\b/);
      if (ordMatch) {
        const orderId = ordMatch[1];
        const order = await Order.findById(orderId).lean();
        if (!order) {
          await session.save();
          return res.json({ reply: `Could not find order ${orderId}. Please provide the correct order ID.`, sessionId });
        }
        // basic status response
        const reply = `Order ${order._id} is currently: ${order.status || "Processing"}. Expected delivery: ${order.expectedDelivery || "N/A"}.`;
        await session.save();
        return res.json({ reply, sessionId });
      } else {
        await session.save();
        return res.json({ reply: "Please provide your order ID to track (e.g., ORD12345).", sessionId });
      }
    }

    // --- 2) list products
    if (/\b(list|show|get)\b.*\b(products|gifts|items|best sellers)\b/i.test(message)) {
      const all = await Product.find().limit(12).lean();
      session.lastProducts = all;
      await session.save();

      const reply = `Here are some products:\n\n${formatProducts(all)}\n\nTell me: "select 1", "select 1 and 3" or "add first and second to cart".`;
      return res.json({ reply, sessionId, products: all, suggestions: ["Select 1", "Add first to cart", "Compare 1 and 3"] });
    }

    // --- 3) selection by number(s)
    const indices = parseNumberIndicesFromText(message);
    if (indices.length > 0 && session.lastProducts && session.lastProducts.length) {
      // map to valid indices
      const chosen = indices.map((i) => session.lastProducts[i]).filter(Boolean);
      if (chosen.length === 0) {
        await session.save();
        return res.json({ reply: "I couldn't find that item in the last list. Try 'show products' first.", sessionId });
      }
      // if one chosen -> set as selectedProduct. If multiple -> set orderData.selection
      if (chosen.length === 1) {
        session.selectedProduct = chosen[0];
        await session.save();
        return res.json({ reply: `You selected: ${chosen[0].title} (₹${chosen[0].price}). Say "add to cart" or "compare".`, sessionId });
      } else {
        // multi-selection: reply with summary and hint to add to cart
        session.orderData.lastSelection = chosen.map((p) => p._id);
        await session.save();
        const list = chosen.map((p, i) => `${i + 1}. ${p.title} - ₹${p.price}`).join("\n");
        return res.json({ reply: `Selected multiple items:\n${list}\nSay "add these to cart" or "compare".`, sessionId });
      }
    }

    // --- 4) add to cart command
    if (/\b(add|put)\b.*\b(cart)\b/i.test(message)) {
      // if user has lastSelection (multi)
      if (session.orderData?.lastSelection?.length) {
        // just acknowledge; actual cart API will add them when frontend clicks 'Add' or user confirms
        await session.save();
        return res.json({ reply: `I can add those ${session.orderData.lastSelection.length} items to your cart. Use the "add to cart" buttons in the UI or say "add these to cart".`, sessionId });
      }

      if (!session.selectedProduct) {
        await session.save();
        return res.json({ reply: "Which product should I add? Say: select 1 or select first.", sessionId });
      }

      // naive add ack (frontend calls /api/cart/add)
      const p = session.selectedProduct;
      await session.save();
      return res.json({ reply: `Added ${p.title} (₹${p.price}) to your cart. Want to checkout? Say "checkout".`, sessionId });
    }

    // --- 5) checkout flow
    if (/\b(checkout|place order|order)\b/i.test(message)) {
      session.orderStage = "ASK_ADDRESS";
      await session.save();
      return res.json({ reply: "Great! Please provide your full shipping address.", sessionId });
    }

    if (session.orderStage === "ASK_ADDRESS") {
      session.orderData.address = message;
      session.orderStage = "ASK_PAYMENT";
      await session.save();
      return res.json({ reply: "Got it! What payment method do you prefer? (COD / UPI / card)", sessionId });
    }

    if (session.orderStage === "ASK_PAYMENT") {
      session.orderData.payment = message;
      session.orderStage = "CONFIRM";
      await session.save();
      const summary = `Your order summary:\nProduct: ${session.selectedProduct?.title || "Multiple items in cart"}\nAddress: ${session.orderData.address}\nPayment: ${session.orderData.payment}\n\nSay "confirm" to place order.`;
      return res.json({ reply: summary, sessionId });
    }

    if (session.orderStage === "CONFIRM" && /\bconfirm\b/i.test(message)) {
      // create order in DB (basic)
      const cartItems = [];
      if (session.orderData?.cart && session.orderData.cart.length) {
        for (const it of session.orderData.cart) {
          const p = await Product.findById(it.productId).lean();
          if (!p) continue;
          cartItems.push({ product: p._id, title: p.title, price: p.price, qty: it.qty });
        }
      } else if (session.selectedProduct) {
        cartItems.push({ product: session.selectedProduct._id, title: session.selectedProduct.title, price: session.selectedProduct.price, qty: 1 });
      }

      const order = await Order.create({
        items: cartItems,
        address: session.orderData.address,
        paymentMethod: session.orderData.payment,
        status: "Placed",
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days default
      });

      // clear session order
      session.orderStage = null;
      session.orderData.cart = [];
      session.selectedProduct = null;
      await session.save();

      return res.json({ reply: `🎉 Order placed successfully! Your order id: ${order._id}. We will send updates shortly.`, sessionId, orderId: order._id });
    }

    // --- 6) gift suggestions (intent)
    if (/\b(gift|suggest|recommend)\b/i.test(message)) {
      const intent = parseShoppingIntent(message);
      const products = await searchProductsByIntent(intent, 8);
      session.lastProducts = products;
      await session.save();
      const reply = `Here are some suggestions:\n${formatProducts(products)}\n\nSay like: select 1 or select second.`;
      return res.json({ reply, sessionId, products, suggestions: ["Select 1", "Add first to cart", "Show more like these"] });
    }

    // --- 7) default AI fallback — tuned for ecommerce
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
