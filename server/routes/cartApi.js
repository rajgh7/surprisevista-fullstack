// server/routes/cartApi.js
import express from "express";
import Product from "../models/Product.js";
import ChatSession from "../models/ChatSession.js";

const router = express.Router();

/**
 * POST /add
 * body: { productId, qty = 1, sessionId }
 * Stores cart in ChatSession.orderData.cart as [{ productId, qty }]
 */
router.post("/add", async (req, res) => {
  try {
    const { productId, qty = 1, sessionId } = req.body;
    if (!productId) return res.json({ error: "productId required" });

    const p = await Product.findById(productId).lean();
    if (!p) return res.json({ error: "not_found" });

    if (!sessionId) {
      // no session -> just return added info (stateless)
      return res.json({
        ok: true,
        added: {
          productId,
          qty,
          title: p.title,
          price: p.price,
        },
      });
    }

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

    session.orderData = session.orderData || {};
    session.orderData.cart = session.orderData.cart || [];

    // merge qty for same product
    const existing = session.orderData.cart.find((c) => c.productId.toString() === productId.toString());
    if (existing) {
      existing.qty += qty;
    } else {
      session.orderData.cart.push({ productId, qty });
    }

    await session.save();

    return res.json({
      ok: true,
      added: {
        productId,
        qty,
        title: p.title,
        price: p.price,
      },
      cartCount: session.orderData.cart.reduce((s, it) => s + it.qty, 0),
    });
  } catch (err) {
    console.error("cart add error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

/**
 * GET /get?sessionId=...
 * returns { ok: true, count: <n>, cart: [ { productId, qty, title, price } ] }
 */
router.get("/get", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.json({ ok: true, count: 0, cart: [] });

    const session = await ChatSession.findOne({ sessionId }).lean();
    if (!session || !session.orderData || !session.orderData.cart) return res.json({ ok: true, count: 0, cart: [] });

    const cart = [];
    for (const it of session.orderData.cart) {
      const p = await Product.findById(it.productId).lean();
      if (!p) continue;
      cart.push({ productId: it.productId, qty: it.qty, title: p.title, price: p.price, image: p.image });
    }

    const count = cart.reduce((s, it) => s + it.qty, 0);
    return res.json({ ok: true, count, cart });
  } catch (err) {
    console.error("cart get error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
