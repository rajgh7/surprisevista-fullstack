// server/services/geminiClient.js
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Your supported model → from listmodels
const MODEL = "models/gemini-2.5-flash";

const API_URL = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${apiKey}`;

export async function generateFromGemini(prompt) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Gemini API Error:", data);
    throw new Error(data.error?.message || "Gemini error");
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response from Gemini."
  );
}
