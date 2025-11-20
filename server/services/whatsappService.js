// services/whatsappService.js
import fetch from "node-fetch";

const API_BASE = (version = "v17.0") => `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const TOKEN = process.env.WHATSAPP_TOKEN;

async function apiPost(payload) {
  const res = await fetch(API_BASE(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("WhatsApp API Error:", res.status, text);
    throw new Error(`WhatsApp API Error: ${res.status}`);
  }
  return res.json();
}

export async function sendText(to, text) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };
  return apiPost(payload);
}

export async function sendImage(to, imageUrl, caption = "") {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { link: imageUrl, caption }
  };
  return apiPost(payload);
}

export async function sendButtons(to, bodyText, buttons = []) {
  // buttons: [{ id: "menu", title: "Browse" }, ...] up to 3
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: { buttons: buttons.map(b => ({ type: "reply", reply: { id: b.id, title: b.title } })) }
    }
  };
  return apiPost(payload);
}

export async function sendInteractiveList(to, headerText, bodyText, rows = []) {
  // rows: [{ id, title, description }]
  const sections = [{
    title: headerText,
    rows: rows.map(r => ({ id: r.id, title: r.title, description: r.description || "" }))
  }];

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      action: {
        button: "View Products",
        sections
      }
    }
  };
  return apiPost(payload);
}
