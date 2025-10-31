// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    qty: Number
  }],
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  amount: Number,
  status: { type: String, default: "pending" },
  paymentInfo: Object
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
