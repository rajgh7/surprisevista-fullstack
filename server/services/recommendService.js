// server/services/recommendService.js
import Product from "../models/Product.js";

export function parseShoppingIntent(text) {
  const t = text.toLowerCase();
  const out = { keywords: [], minPrice: 0, maxPrice: 999999, age: null, gender: null, theme: null };

  const price = t.match(/under\s*(\d+)/);
  if (price) out.maxPrice = Number(price[1]);

  const between = t.match(/between\s*(\d+)\s*and\s*(\d+)/);
  if (between) {
    out.minPrice = Number(between[1]);
    out.maxPrice = Number(between[2]);
  }

  const age = t.match(/(\d{1,2})\s*(year|yo|old)/);
  if (age) out.age = Number(age[1]);

  if (/\b(boy|male|man|husband|dad)\b/.test(t)) out.gender = "male";
  if (/\b(girl|female|woman|wife|mom)\b/.test(t)) out.gender = "female";

  const theme = t.match(/\b(cute|romantic|funny|personalized|superhero|floral)\b/);
  if (theme) out.theme = theme[0];

  out.keywords = t.split(/\s+/).filter((w) => w.length > 2).slice(0, 10);

  return out;
}

export async function searchProductsByIntent(intent, limit = 8) {
  const or = [];

  if (intent.keywords.length) {
    or.push({ title: { $regex: intent.keywords.join("|"), $options: "i" } });
    or.push({ description: { $regex: intent.keywords.join("|"), $options: "i" } });
  }

  if (intent.theme) {
    or.push({ tags: { $in: [intent.theme] } });
  }

  return Product.find({
    price: { $gte: intent.minPrice, $lte: intent.maxPrice },
    ...(or.length ? { $or: or } : {})
  })
    .limit(limit)
    .lean();
}
