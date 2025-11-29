import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Missing GEMINI_API_KEY in environment!");
}

// Force SDK to use v1 instead of v1beta
const genAI = new GoogleGenerativeAI(apiKey, {
  baseUrl: "https://generativelanguage.googleapis.com/v1"
});

export async function generateFromGemini(prompt, options = {}) {
  try {
    const modelName = process.env.GEMINI_MODEL || "models/gemini-1.5-flash";

    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: options.max_tokens || 300,
        temperature: options.temperature || 0.2,
      },
    });

    return result.response.text();

  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}
