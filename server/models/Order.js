import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  address: String,
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
      image: String,
    },
  ],
  total: Number,
  paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
  razorpayDetails: { type: Object, default: null },
  createdAt: Date,
});

export default mongoose.model("Order", orderSchema);
