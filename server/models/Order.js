 /* import mongoose from "mongoose";

// Item schema (NO _id inside items)
const itemSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false } // 🚀 Prevents Mongoose from adding _id inside each item
);

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true },

  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: { type: String, required: true },

  items: [itemSchema],     // 🚀 SAFE — no nested _id here
  total: Number,

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD",
  },

  razorpayDetails: { type: Object, default: null },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema); */





import mongoose from "mongoose";

// Item schema (NO _id inside items)
const itemSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

// Order schema
const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: { type: String, required: true },

    items: [itemSchema],
    total: Number,

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    // ⭐ NEW — status for tracking
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Out for delivery", "Delivered"],
      default: "Placed",
    },

    razorpayDetails: { type: Object, default: null },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // ⭐ Auto-handles createdAt & updatedAt
  }
);

export default mongoose.model("Order", orderSchema);

