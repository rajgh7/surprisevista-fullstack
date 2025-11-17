// server/routes/contactRoutes.js
import express from "express";
import Contact from "../models/Contact.js";
import { body, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

/* Rate limit */
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: "Too many requests. Try again soon." },
});

/* Validation */
const validateContact = [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail(),
  body("message").trim().isLength({ min: 5 }),
  body("recaptchaToken").notEmpty(),
];

/* Verify reCAPTCHA */
async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  const res = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    }
  );
  const data = await res.json();
  return data.success === true;
}

/* Main handler */
router.post("/", contactLimiter, validateContact, async (req, res) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) return res.status(400).json({ errors: results.array() });

    const { name, email, phone, message, recaptchaToken } = req.body;

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) return res.status(400).json({ message: "reCAPTCHA failed" });

    const cleanMessage = sanitizeHtml(message);

    await Contact.create({ name, email, phone, message: cleanMessage });

    /* Admin email */
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: process.env.MAIL_TO,
      subject: `📩 New enquiry from ${name}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong><br/>${cleanMessage}</p>
      `,
    });

    /* Auto reply */
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: email,
      subject: "🎁 Thank you for contacting SurpriseVista!",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for contacting <strong>SurpriseVista</strong>! We will reach you soon.</p>
      `,
    });

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
