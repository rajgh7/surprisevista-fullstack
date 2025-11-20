

// routes/whatsappRoutes.js
import express from "express";
import { webhookVerify, handleIncoming } from "../controllers/whatsappController.js";

const router = express.Router();

// GET for webhook verification by Meta
router.get("/", webhookVerify);

// POST for incoming messages/events
router.post("/", express.json(), handleIncoming);

export default router;
