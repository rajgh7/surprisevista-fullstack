import express from "express";
import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Admin notification
    await transporter.sendMail({
      from: `"SurpriseVista" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `📩 New Enquiry from ${req.body.name}`,
      html: `
        <h3>New Contact Submission</h3>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Phone:</strong> ${req.body.phone}</p>
        <p><strong>Message:</strong> ${req.body.message}</p>
      `,
    });

    // Auto-reply to customer
    await transporter.sendMail({
      from: `"SurpriseVista" <${process.env.MAIL_USER}>`,
      to: req.body.email,
      subject: "🎁 Thank you for reaching SurpriseVista!",
      html: `
        <p>Hi ${req.body.name},</p>
        <p>Thank you for contacting <strong>SurpriseVista</strong>!  
        We’ve received your enquiry and will get back to you soon.</p>
        <p>Warm regards,<br/>The SurpriseVista Team 🎉</p>
      `,
    });

    res.status(200).json({ message: "Contact saved and emails sent" });
  } catch (error) {
    console.error("❌ Contact submission error:", error);
    res.status(500).json({ message: "Failed to save contact or send emails" });
  }
});

export default router;
