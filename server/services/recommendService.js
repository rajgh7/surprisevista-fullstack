// server/services/recommendService.js
import Product from "../models/Product.js";

/**
 * Basic intent -> filter extractor
 * Input: free text (e.g. "gift under 600 for 8 year old boy romantic")
 * Output: { keywords, minPrice, maxPrice, age, gender, occasion, theme }
 */
export function parseShoppingIntent(text) {
  const lower = (text||"").toLowerCase();
  const out = { keywords: [], minPrice: 0, maxPrice: Number.POSITIVE_INFINITY, age: null, gender: null, occasion: null, theme: null };

  // price
  const priceMatch = lower.match(/under\s*₹?(\d{2,6})|under\s*(\d{2,6})|below\s*₹?(\d{2,6})/);
  if (priceMatch) out.maxPrice = Number(priceMatch[1]||priceMatch[2]||priceMatch[3]);

  const betweenMatch = lower.match(/between\s*₹?(\d{2,6})\s*(and|-)\s*₹?(\d{2,6})/);
  if (betweenMatch) { out.minPrice = Number(betweenMatch[1]); out.maxPrice = Number(betweenMatch[3]); }

  // age
  const ageMatch = lower.match(/(\b\d{1,2})\s*(year|yr|yrs|yo|old)/);
  if (ageMatch) out.age = Number(ageMatch[1]);

  // gender
  if (/\b(boy|male|man|husband|dad|father)\b/.test(lower)) out.gender = "male";
  if (/\b(girl|female|woman|wife|mom|mother)\b/.test(lower)) out.gender = "female";

  // occasion
  if (/\b(birthday|anniversary|engagement|wedding|valentine|valentines|christmas|new year|diwali|festival)\b/.test(lower)) {
    out.occasion = lower.match(/\b(birthday|anniversary|engagement|wedding|valentine|valentines|christmas|diwali|festival)\b/)[0];
  }

  // theme: keywords like superhero, romantic, floral, personalized
  const themeMatch = lower.match(/\b(superhero|romantic|floral|personalized|cute|funny|edible|luxury|budget|eco|handmade|social)\b/);
  if (themeMatch) out.theme = themeMatch[0];

  // remaining keywords
  out.keywords = lower.split(/\s+/).filter(w => w.length>2).slice(0,8);

  return out;
}

/**
 * Run a DB search with the intent filters (simple hybrid)
 */
export async function searchProductsByIntent(intent, limit=8) {
  const q = intent.keywords.join(" ");
  const filters = {
    price: { $gte: intent.minPrice || 0, $lte: intent.maxPrice || Number.POSITIVE_INFINITY }
  };

  // Build mongo query
  const or = [];
  if (q) {
    or.push({ title: { $regex: q, $options: 'i' } });
    or.push({ description: { $regex: q, $options: 'i' } });
    or.push({ tags: { $in: intent.keywords } });
  }
  if (intent.theme) or.push({ tags: intent.theme });

  if (intent.age) or.push({ tags: { $in: [`age:${intent.age}`, `kids`] } });

  // Final query
  const query = or.length ? { $and: [ { $or: or }, { price: filters.price } ] } : { price: filters.price };

  const products = await Product.find(query).limit(limit).lean();
  return products;
}
