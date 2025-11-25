// server/services/whatsappService.js
import fetch from "node-fetch";

const API_VERSION = "v22.0";

function getApiUrl() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  return `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;
}

function normalizePhoneNumber(to) {
  if (!to) return to;
  let phone = to.replace(/\D/g, "");
  if (!phone.startsWith("91")) phone = "91" + phone;
  return phone;
}

const TOKEN = process.env.WHATSAPP_TOKEN;

async function apiPost(payload) {
  const url = getApiUrl();

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
   SEND TEMPLATE MESSAGE
============================================================ */
export async function sendTemplate(to, templateName, components = []) {
  const phone = normalizePhoneNumber(to);

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components,
    },
  });
}

/* Text message (NOT used anymore but kept for chatbot) */
export async function sendText(to, message) {
  const phone = normalizePhoneNumber(to);
  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: message },
  });
}

export async function sendImage(to, imageUrl, caption = "") {
  const phone = normalizePhoneNumber(to);
  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "image",
    image: { link: imageUrl, caption },
  });
}

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

export async function sendInteractiveList(to, headerText, bodyText, rows = []) {
  const phone = normalizePhoneNumber(to);

  return apiPost({
    messaging_product: "whatsapp",
    to: phone,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      action: { button: "View Options", sections: [{ title: headerText, rows }] },
    },
  });
}
