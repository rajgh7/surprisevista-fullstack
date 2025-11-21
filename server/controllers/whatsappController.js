// controllers/whatsappController.js
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {
  sendText,
  sendInteractiveList,
  sendImage,
  sendButtons,
} from "../services/whatsappService.js";
import crypto from "crypto";

const sessions = new Map(); // phone -> { cart, step, currentProduct }

export function webhookVerify(req, res) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ WhatsApp Webhook Verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

function getSession(phone) {
  if (!sessions.has(phone))
    sessions.set(phone, { cart: [], step: "idle", currentProduct: null });
  return sessions.get(phone);
}

function demoProduct(id) {
  const i = Number(id.split("-")[1] || 1);
  return {
    _id: id,
    name: `Demo Gift ${i}`,
    price: 499 + i * 10,
    image: "images/prod1.jpg",
    description: "Demo product",
    category: "Retail",
  };
}

export async function handleIncoming(req, res) {
  try {
    const body = req.body;
    if (!body?.entry) return res.sendStatus(200);

    const change = body.entry[0]?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const type = message.type;
    const session = getSession(from);

    const senderName =
      contact?.profile?.name || contact?.wa_id || from;

    /** ================================
     * 1. Handle INTERACTIVE replies
     * ================================*/
    if (message.interactive) {
      const inter = message.interactive;

      // LIST → product selection
      if (inter.type === "list_reply") {
        const id = inter.list_reply.id;
        if (id.startsWith("product_")) {
          const pid = id.replace("product_", "");
          let product =
            pid.startsWith("demo-")
              ? demoProduct(pid)
              : await Product.findById(pid).lean();

          if (!product) product = demoProduct(pid);

          session.currentProduct = {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
          };
          session.step = "selected_product";

          await sendText(
            from,
            `You selected *${product.name}*\nPrice: ₹${product.price}\n\nType *buy* to add to cart or *menu* to browse more.`
          );
          return res.sendStatus(200);
        }
      }

      // BUTTON REPLY
      if (inter.type === "button_reply") {
        const action = inter.button_reply.id;

        if (action === "view_cart") {
          const cart = session.cart;
          if (!cart.length)
            await sendText(from, "Your cart is empty. Type *menu* to browse products.");
          else {
            let msg = "🛒 *Your Cart*\n\n";
            cart.forEach(
              (it, idx) =>
                (msg += `${idx + 1}. ${it.name} x${it.qty} — ₹${
                  it.price * it.qty
                }\n`)
            );
            msg += `\nType *checkout* to place order.`;
            await sendText(from, msg);
          }
          return res.sendStatus(200);
        }

        if (action === "track_order") {
          await sendText(
            from,
            "Please send your order code.\nExample: *track SV-20250101-12345*"
          );
          return res.sendStatus(200);
        }
      }
    }

    /** ================================
     * 2. TEXT MESSAGES
     * ================================*/
    if (type === "text") {
      const textRaw = message.text.body.trim();
      const text = textRaw.toLowerCase();

      /** ==========================
       * ⭐ ORDER TRACKING
       * ==========================*/
      const trackMatch = text.match(
        /(?:track|status)\s+([A-Za-z0-9\-]+)/i
      );
      const pureOrderCodeMatch = textRaw.match(/^SV[-A-Za-z0-9]+$/i);

      if (trackMatch || pureOrderCodeMatch) {
        const orderCode = (trackMatch?.[1] || pureOrderCodeMatch[0]).toUpperCase();

        let order =
          (await Order.findOne({ orderCode }).lean()) ||
          (orderCode.match(/^[0-9a-fA-F]{24}$/)
            ? await Order.findById(orderCode).lean()
            : null);

        if (!order) {
          await sendText(
            from,
            `❌ Order *${orderCode}* not found.\nCheck the code and try again.`
          );
          return res.sendStatus(200);
        }

        const status = order.status || "Placed";
        const createdAt = new Date(order.createdAt).toLocaleString("en-IN");
        const itemsText = order.items
          .map(
            (i) => `• ${i.name} x${i.qty} — ₹${i.price * i.qty}`
          )
          .join("\n");

        let eta = "We will update you soon.";
        if (status.toLowerCase().includes("processing")) eta = "Your order is being packed.";
        if (status.toLowerCase().includes("shipped")) eta = "Expected delivery: 1–3 days.";
        if (status.toLowerCase().includes("delivered")) eta = "Delivered. 🎉";

        const reply = `🧾 *Order:* ${order.orderCode}
📌 *Status:* ${status}
🕒 *Placed:* ${createdAt}
💰 *Total:* ₹${order.total}
📍 *Address:* ${order.address}

*Items:*
${itemsText}

${eta}

Reply *menu* to browse or *help* for assistance.`;

        await sendText(from, reply);
        return res.sendStatus(200);
      }

      /** ==========================
       * MENU
       * ==========================*/
      if (text === "menu") {
        const products = await Product.find().limit(20).lean();
        const rows = products.length
          ? products.map((p) => ({
              id: `product_${p._id}`,
              title: p.name,
              description: `₹${p.price}`,
            }))
          : Array.from({ length: 8 }).map((_, i) => ({
              id: `product_demo-${i + 1}`,
              title: `Demo Gift ${i + 1}`,
              description: `₹${499 + (i + 1) * 10}`,
            }));

        await sendInteractiveList(
          from,
          "SurpriseVista Products",
          "Choose a product:",
          rows
        );
        session.step = "browsing";
        return res.sendStatus(200);
      }

      /** ==========================
       * BUY
       * ==========================*/
      if (text === "buy") {
        if (!session.currentProduct) {
          await sendText(from, "No product selected. Type *menu* to browse.");
          return res.sendStatus(200);
        }

        const item = { ...session.currentProduct, qty: 1 };
        session.cart.push(item);

        await sendText(
          from,
          `🛒 Added *${item.name}* to cart.\nType *checkout* or *menu*.`
        );

        session.currentProduct = null;
        session.step = "idle";
        return res.sendStatus(200);
      }

      /** ==========================
       * CART
       * ==========================*/
      if (text === "cart") {
        const cart = session.cart;
        if (!cart.length)
          await sendText(from, "Cart is empty. Type *menu* to browse.");
        else {
          let msg = "🛒 *Your Cart*\n\n";
          cart.forEach(
            (it, idx) =>
              (msg += `${idx + 1}. ${it.name} x${it.qty} — ₹${
                it.price * it.qty
              }\n`)
          );
          msg += `\nType *checkout* to place order.`;
          await sendText(from, msg);
        }
        return res.sendStatus(200);
      }

      /** ==========================
       * CHECKOUT
       * ==========================*/
      if (text === "checkout") {
        if (!session.cart.length) {
          await sendText(from, "Your cart is empty. Type *menu* to browse.");
          return res.sendStatus(200);
        }

        session.step = "awaiting_details";
        await sendText(
          from,
          "Please send: *Name | email@example.com | phone | full address*"
        );
        return res.sendStatus(200);
      }

      /** ==========================
       * USER DETAILS (Name | Email | Phone | Address)
       * ==========================*/
      if (session.step === "awaiting_details") {
        const parts = textRaw.split("|").map((p) => p.trim());
        if (parts.length < 4) {
          await sendText(
            from,
            "Invalid format.\nSend: *Name | email | phone | full address*"
          );
          return res.sendStatus(200);
        }

        const [name, email, phoneNumber, address] = parts;

        const total = session.cart.reduce(
          (s, it) => s + it.price * (it.qty || 1),
          0
        );

        const orderCode = `SV-${crypto.randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

        const orderPayload = {
          orderCode,
          name,
          email,
          phone: phoneNumber,
          address,
          items: session.cart,
          total,
          paymentMethod: "ONLINE",
          createdAt: new Date(),
        };

        const created = await Order.create(orderPayload);

        const upiId = process.env.UPI_ID || "surprisevista@upi";
        const qrUrl = process.env.UPI_QR_IMAGE_URL || null;

        if (qrUrl) {
          await sendImage(from, qrUrl, `Scan to pay ₹${total}`);
        }

        await sendText(
          from,
          `🎉 Order *${orderCode}* created!\nTotal: ₹${total}\nUPI: *${upiId}*\n\nAfter payment, reply: *PAID ${orderCode}*`
        );

        session.cart = [];
        session.step = "idle";
        return res.sendStatus(200);
      }

      /** ==========================
       * PAYMENT CONFIRMATION — "PAID CODE"
       * ==========================*/
      if (text.startsWith("paid")) {
        const code = textRaw.split(" ")[1];
        if (!code) {
          await sendText(from, "Send: PAID <ORDER_CODE>");
          return res.sendStatus(200);
        }

        const order = await Order.findOne({ orderCode: code });
        if (!order) {
          await sendText(from, `Order *${code}* not found.`);
          return res.sendStatus(200);
        }

        order.paymentMethod = "ONLINE";
        order.razorpayDetails = {
          status: "manual-upi-paid",
          paidAt: new Date(),
        };
        await order.save();

        await sendText(
          from,
          `💚 Payment confirmed for order *${code}*.\nWe will ship it soon!`
        );
        return res.sendStatus(200);
      }

      /** ==========================
       * FALLBACK
       * ==========================*/
      await sendButtons(from, "How can I help you?", [
        { id: "menu", title: "Browse" },
        { id: "view_cart", title: "Cart" },
        { id: "track_order", title: "Track Order" },
      ]);

      return res.sendStatus(200);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ WhatsApp webhook error:", err);
    res.sendStatus(500);
  }
}
