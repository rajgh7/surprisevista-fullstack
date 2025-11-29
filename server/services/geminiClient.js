// backend/services/geminiClient.js
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Free-tier model (works for all free API keys)
const MODEL = "models/gemini-pro";

// Endpoint for free tier
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/" +
  MODEL +
  ":generateContent?key=" +
  apiKey;

export async function generateFromGemini(prompt) {
  try {
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini Error Response:", data);
      throw new Error(data.error?.message || "Gemini request failed");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reply from Gemini.";

    return text;
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}
