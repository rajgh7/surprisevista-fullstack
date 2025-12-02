// server/services/recommendService.js
import Product from "../models/Product.js";

/**
 * parseShoppingIntent: improved rules
 */
export function parseShoppingIntent(text) {
  const t = (text || "").toLowerCase();
  const out = { keywords: [], minPrice: 0, maxPrice: 9999999, age: null, gender: null, theme: null, delivery: null, occasion: null };

  // price: under X, under ₹X, less than X
  let m = t.match(/under\s*₹?\s*([\d,]+)/);
  if (!m) m = t.match(/under\s*([\d,]+)/);
  if (m) out.maxPrice = Number(m[1].replace(/,/g, ""));

  // between X and Y
  const between = t.match(/between\s*₹?([\d,]+)\s*(and|-)\s*₹?([\d,]+)/);
  if (between) {
    out.minPrice = Number(between[1].replace(/,/g, ""));
    out.maxPrice = Number(between[3].replace(/,/g, ""));
  }

  // "cheap" or "luxury"
  if (/\b(cheap|budget|affordable)\b/.test(t)) out.theme = "budget";
  if (/\b(luxury|premium|expensive)\b/.test(t)) out.theme = "premium";

  // delivery keywords
  if (/\bsame[-\s]?day\b/.test(t)) out.delivery = "same-day";
  if (/\bnext\s*day\b/.test(t)) out.delivery = "next-day";

  // age detection
  const age = t.match(/(\d{1,2})\s*(year|yo|old)/);
  if (age) out.age = Number(age[1]);

  // gender / recipient
  if (/\b(boy|male|man|husband|dad|father)\b/.test(t)) out.gender = "male";
  if (/\b(girl|female|woman|wife|mom|mother)\b/.test(t)) out.gender = "female";
  if (/\b(kids|child|children)\b/.test(t)) out.age = out.age || 6; // general kids

  // occasion
  const occasion = t.match(/\b(birthday|anniversary|valentine|diwali|christmas|wedding)\b/);
  if (occasion) out.occasion = occasion[0];

  // theme keywords
  const theme = t.match(/\b(cute|romantic|funny|personalized|superhero|floral|tech|gadget|home)\b/);
  if (theme) out.theme = theme[0];

  // sentiment keywords to use as additional keywords
  const rawWords = t.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  out.keywords = rawWords.filter((w) => w.length > 2).slice(0, 12);

  return out;
}

export async function searchProductsByIntent(intent, limit = 8) {
  const or = [];

  if (intent.keywords && intent.keywords.length) {
    // create regex from keywords
    const re = intent.keywords.join("|");
    or.push({ title: { $regex: re, $options: "i" } });
    or.push({ description: { $regex: re, $options: "i" } });
  }

  if (intent.theme && intent.theme !== "budget" && intent.theme !== "premium") {
    or.push({ tags: { $in: [intent.theme] } });
  }

  // occasion routing to tags
  if (intent.occasion) {
    or.push({ tags: { $in: [intent.occasion] } });
  }

  // price range
  const q = {
    price: { $gte: Math.max(0, intent.minPrice || 0), $lte: intent.maxPrice || 9999999 },
    ...(or.length ? { $or: or } : {}),
  };

  // premium/budget handling
  if (intent.theme === "budget") q.price = { $lte: Math.max(1000, intent.maxPrice || 1000) };
  if (intent.theme === "premium") q.price = { $gte: Math.max(2000, intent.minPrice || 2000) };

  return Product.find(q).limit(limit).lean();
}
