// backend/services/geminiClient.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Missing GEMINI_API_KEY in environment!");
}

// Force SDK to use Gemini v1 endpoint
const genAI = new GoogleGenerativeAI(apiKey, {
  apiEndpoint: "https://generativelanguage.googleapis.com/v1"
});

export async function generateFromGemini(prompt, options = {}) {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",  // FULL PATH REQUIRED
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        }
      ],
      generationConfig: {
        maxOutputTokens: options.max_tokens || 300,
        temperature: options.temperature || 0.2,
      }
    });

    return result.response.text();

  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}
