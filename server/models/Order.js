import mongoose from 'mongoose';
const OrderSchema = new mongoose.Schema({ name: String, email: String, address: String, phone: String, cart: Array, totalAmount: Number, date: { type: Date, default: Date.now } });
export default mongoose.model('Order', OrderSchema);
