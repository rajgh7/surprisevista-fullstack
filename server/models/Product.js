import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ["Party", "Corporate", "Retail"], required: true },
    // MRP = original listed price, price = current selling price (after discount)
    mrp: { type: Number, default: 0 },
    discount: { type: Number, default: 0 }, // percentage (0-100)
    price: { type: Number, required: true }, // final selling price (computed if needed)
    description: { type: String, default: "" },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    isOnSale: { type: Boolean, default: false },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 9999 }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
