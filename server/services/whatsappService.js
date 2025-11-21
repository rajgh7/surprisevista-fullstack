// server/services/whatsappService.js
import fetch from "node-fetch";

/* ============================================================
   CONFIGURATION
============================================================ */

const API_VERSION = "v22.0"; // 💡 use latest working version from Meta dashboard

function getApiUrl() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneId) {
    console.error("❌ Missing WHATSAPP_PHONE_NUMBER_ID in environment.");
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  }

  // Full WhatsApp API URL
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;
  return url;
}

function normalizePhoneNumber(to) {
  if (!to) return to;
  return to.replace(/\+/g, "").trim(); // remove + sign
}

const TOKEN = process.env.WHATSAPP_TOKEN;

/* ============================================================
   GENERIC API POST HANDLER
============================================================ */

async function apiPost(payload) {
  const url = getApiUrl();

  if (!TOKEN) {
    console.error("❌ Missing WHATSAPP_TOKEN in .env");
    throw new Error("Missing WHATSAPP_TOKEN");
  }

  // Debug for Render
  console.log("🌐 WhatsApp API URL:", url);
  console.log("📤 Sending Payload:", JSON.stringify(payload));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("❌ WhatsApp API Error:", res.status, text);
    throw new Error(`WhatsApp API Error: ${res.status}`);
  }

  console.log("✅ WhatsApp API Response:", text);
  return JSON.parse(text);
}

/* ============================================================
   TEXT MESSAGE
============================================================ */

export async function sendText(to, message) {
  const phone = normalizePhoneNumber(to);

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: message },
  });
}

/* ============================================================
   IMAGE MESSAGE
============================================================ */

export async function sendImage(to, imageUrl, caption = "") {
  const phone = normalizePhoneNumber(to);

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "image",
    image: {
      link: imageUrl,
      caption,
    },
  });
}

/* ============================================================
   BUTTON MESSAGE
============================================================ */

export async function sendButtons(to, bodyText, buttons = []) {
  const phone = normalizePhoneNumber(to);

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

/* ============================================================
   INTERACTIVE LIST MESSAGE
============================================================ */

export async function sendInteractiveList(to, headerText, bodyText, rows = []) {
  const phone = normalizePhoneNumber(to);

  const sections = [
    {
      title: headerText,
      rows: rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
      })),
    },
  ];

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      action: {
        button: "View Options",
        sections,
      },
    },
  });
}
