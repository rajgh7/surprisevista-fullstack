// controllers/whatsappController.js
import Product from "../models/Product.js"; // product schema used for catalog. :contentReference[oaicite:3]{index=3}
import Order from "../models/Order.js";     // order model. :contentReference[oaicite:4]{index=4}
import { sendText, sendInteractiveList, sendImage, sendButtons } from "../services/whatsappService.js";
import crypto from "crypto";

const sessions = new Map(); // simple in-memory sessions: phone -> { cart: [], step, currentProduct }

export function webhookVerify(req, res) {
  // Meta verification: GET /webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook verified by Meta");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
}

function getSession(phone) {
  if (!sessions.has(phone)) sessions.set(phone, { cart: [], step: "idle" });
  return sessions.get(phone);
}

// Helper to build demo product for demo- ids (productRoutes had demo fallback). :contentReference[oaicite:5]{index=5}
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

    // Meta wraps messages inside entry[] -> changes[] -> value.messages
    if (!body.entry) return res.sendStatus(200);

    const change = body.entry[0]?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from; // phone number
    const type = message.type;
    const session = getSession(from);

    // Handle interactive replies
    if (message.interactive) {
      const interactive = message.interactive;
      if (interactive.type === "list_reply") {
        const id = interactive.list_reply.id; // e.g., product_<id>
        // product selection
        if (id && id.startsWith("product_")) {
          const pid = id.split("product_")[1];
          let product = null;
          if (pid.startsWith("demo-")) {
            product = demoProduct(pid);
          } else {
            product = await Product.findById(pid).lean();
            if (!product) product = demoProduct(pid); // fallback
          }
          session.currentProduct = {
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
          };
          session.step = "selected_product";
          await sendText(from, `You selected *${product.name}*\nPrice: ₹${product.price}\nType *buy* to add to cart or *menu* to continue browsing.`);
          return res.sendStatus(200);
        }
      } else if (interactive.type === "button_reply") {
        const payload = interactive.button_reply.id;
        if (payload === "view_cart") {
          // show cart
          const cart = session.cart || [];
          if (!cart.length) {
            await sendText(from, "Your cart is empty. Type *menu* to browse products.");
          } else {
            let msg = "Your Cart:\n";
            cart.forEach((it, idx) => {
              msg += `${idx + 1}. ${it.name} x${it.qty} - ₹${it.price * it.qty}\n`;
            });
            msg += `\nType *checkout* to place order or *menu* to continue.`;
            await sendText(from, msg);
          }
          return res.sendStatus(200);
        }
      }
    }

    // Text messages handling
    if (type === "text") {
      const text = message.text.body.trim().toLowerCase();

      if (text === "menu") {
        // send interactive list of products (first 10)
        const products = await Product.find().limit(20).lean();
        if (!products.length) {
          // demo list
          const rows = [];
          for (let i = 1; i <= 8; i++) {
            rows.push({
              id: `product_demo-${i}`,
              title: `Demo Gift ${i}`,
              description: `₹${499 + i * 10}`,
            });
          }
          await sendInteractiveList(from, "SurpriseVista Products", "Choose product:", rows);
        } else {
          const rows = products.slice(0, 20).map((p) => ({
            id: `product_${p._id}`,
            title: p.name,
            description: `₹${p.price}`,
          }));
          await sendInteractiveList(from, "SurpriseVista Products", "Choose product:", rows);
        }
        session.step = "browsing";
        return res.sendStatus(200);
      }

      if (text === "buy") {
        if (!session.currentProduct) {
          await sendText(from, "No product selected. Type *menu* to browse products.");
          return res.sendStatus(200);
        }
        // add to cart
        const item = { ...session.currentProduct, qty: 1 };
        session.cart.push(item);
        await sendText(from, `✅ Added *${item.name}* to cart.\nType *checkout* to place order or *menu* to keep browsing.`);
        session.currentProduct = null;
        session.step = "idle";
        return res.sendStatus(200);
      }

      if (text === "cart") {
        const cart = session.cart || [];
        if (!cart.length) {
          await sendText(from, "Cart is empty. Type *menu* to browse.");
        } else {
          let msg = "Your Cart:\n";
          cart.forEach((it, idx) => {
            msg += `${idx + 1}. ${it.name} x${it.qty} - ₹${it.price * it.qty}\n`;
          });
          msg += `\nType *checkout* to place order.`;
          await sendText(from, msg);
        }
        return res.sendStatus(200);
      }

      if (text === "checkout") {
        const cart = session.cart || [];
        if (!cart.length) {
          await sendText(from, "Your cart is empty. Type *menu* to browse.");
          return res.sendStatus(200);
        }

        // Ask for name, email, address sequentially
        session.step = "awaiting_details";
        await sendText(from, "Great! Please share your details in this format:\nName | email@example.com | 10-digit-phone | full address");
        return res.sendStatus(200);
      }

      // If awaiting details
      if (session.step === "awaiting_details") {
        // Expect: Name | email | phone | address
        const parts = message.text.body.split("|").map(p => p.trim());
        if (parts.length < 4) {
          await sendText(from, "Invalid format. Please send: Name | email@example.com | 10-digit-phone | full address");
          return res.sendStatus(200);
        }
        const [name, email, phoneNumber, address] = parts;
        // compute total
        const total = (session.cart || []).reduce((s, it) => s + (it.price * (it.qty || 1)), 0);

        // create orderCode
        const orderCode = `SV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

        const orderPayload = {
          orderCode,
          name,
          email,
          phone: phoneNumber,
          address,
          items: session.cart.map(it => ({ name: it.name, price: it.price, qty: it.qty || 1, image: it.image })),
          total,
          paymentMethod: "ONLINE",
          razorpayDetails: null,
        };

        // Save order to DB
        const created = await Order.create(orderPayload);

        // Send payment instructions (Phase 1: UPI placeholder)
        const upiId = process.env.UPI_ID || "surprisevista@upi";
        const upiQr = process.env.UPI_QR_IMAGE_URL || ""; // optional URL to QR image for quick testing

        let paymentMsg = `Order *${orderCode}* created.\nTotal: ₹${total}\n\nPay using UPI ID: *${upiId}*`;
        if (upiQr) {
          // send image then text
          await sendImage(from, upiQr, `Scan this QR or pay to ${upiId}`);
        }
        paymentMsg += `\n\nAfter payment, reply with *PAID ${orderCode}* to notify us.`;
        await sendText(from, paymentMsg);

        // clear cart
        session.cart = [];
        session.step = "idle";

        // Optionally: notify admin via email (your orderRoutes already sends emails on orders when using the frontend API; this controller only stores the order in DB)
        return res.sendStatus(200);
      }

      // Payment confirmation message: "paid SV-ABC123"
      if (text.startsWith("paid")) {
        const tokens = message.text.body.split(" ").map(t => t.trim());
        const code = tokens[1];
        if (!code) {
          await sendText(from, "Please include your order code. Example: PAID SV-XXXX");
          return res.sendStatus(200);
        }
        // Try find the order
        const order = await Order.findOne({ orderCode: code });
        if (!order) {
          await sendText(from, `Order ${code} not found. Please check the code.`);
          return res.sendStatus(200);
        }
        // Mark payment received (basic)
        order.paymentMethod = "ONLINE";
        order.razorpayDetails = { status: "manual-upi-paid", paidAt: new Date() };
        await order.save();

        await sendText(from, `Thank you! Payment for order *${code}* marked as received. We will process and ship soon.`);
        return res.sendStatus(200);
      }

      // fallback
      await sendButtons(from, "Hello from SurpriseVista Gifts 🎁", [
        { id: "menu", title: "Browse Menu" },
        { id: "view_cart", title: "View Cart" },
      ]);
      return res.sendStatus(200);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error", err);
    res.sendStatus(500);
  }
}
