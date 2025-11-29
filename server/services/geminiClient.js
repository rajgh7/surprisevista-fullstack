// backend/services/geminiClient.js
// Flexible Gemini HTTP client (uses node-fetch which you already have)
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
// GEMINI_ENDPOINT should be the complete URL to call; if you have official SDK, we'll replace later
// Example placeholder: https://api.example.com/v1/generate
const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT || process.env.GEMINI_HTTP_URL || null;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not set. AI responses will fail until you set it.");
}

async function generateFromGemini(prompt, options = {}) {
  if (!GEMINI_ENDPOINT) {
    throw new Error("GEMINI_ENDPOINT not configured in environment. Set GEMINI_ENDPOINT to a valid HTTP endpoint for your Gemini API.");
  }

  const body = {
    model: GEMINI_MODEL,
    prompt,
    max_tokens: options.max_tokens ?? 512,
    temperature: options.temperature ?? 0.2,
    // add any other provider-specific options here
  };

  const res = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify(body),
    // no credentials
  });

  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`Gemini API error: ${res.status} ${res.statusText} - ${txt}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();

  // The response shape varies by provider. Try a few common patterns:
  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.output?.[0]?.content?.text ||
    data?.result ||
    JSON.stringify(data);

  return text;
}

export { generateFromGemini };
