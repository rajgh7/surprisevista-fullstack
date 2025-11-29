// backend/models/ChatSession.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  ts: { type: Date, default: Date.now },
}, { _id: false });

const ChatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true, unique: true },
  userId: { type: String, default: null },
  messages: [chatMessageSchema],
}, { timestamps: true });

const ChatSession = mongoose.models.ChatSession || mongoose.model("ChatSession", ChatSessionSchema);
export default ChatSession;
