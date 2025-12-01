// backend/services/geminiClient.js
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Your supported model (from listModels)
const MODEL = "models/gemini-2.5-flash";

// Correct endpoint for new Gemini API (v1)
const API_URL =
  `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${apiKey}`;

export async function generateFromGemini(prompt) {
  try {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || "Gemini request failed");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
