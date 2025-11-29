// backend/services/geminiClient.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Missing GEMINI_API_KEY in environment!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateFromGemini(prompt, options = {}) {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    });

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

    const responseText = result.response.text();
    return responseText;
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}
