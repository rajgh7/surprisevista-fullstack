// server/routes/contactRoutes.js
import express from "express";
import Contact from "../models/Contact.js";
import { body, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

/* Rate limit */
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  message: { message: "Too many requests. Try later." },
});

/* Validation */
const validateContact = [
  body("name").trim().notEmpty(),
  body("email").isEmail(),
  body("message").trim().isLength({ min: 5 }),
];

/* Main handler */
router.post("/", contactLimiter, validateContact, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, message } = req.body;

    const cleanMsg = sanitizeHtml(message);

    await Contact.create({ name, email, phone, message: cleanMsg });

    // Admin email
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: process.env.MAIL_TO,
      subject: `📩 New enquiry from ${name}`,
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong><br/>${cleanMsg}</p>
      `,
    });

    // Auto reply
    await resend.emails.send({
      from: "SurpriseVista <onboarding@resend.dev>",
      to: email,
      subject: "🎁 Thank You for Contacting SurpriseVista!",
      html: `
        <p>Hi ${name},</p>
        <p>We received your message and will reach you shortly.</p>
        <p>Warm Regards,<br/>SurpriseVista Team</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
