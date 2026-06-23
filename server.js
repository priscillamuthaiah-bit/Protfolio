const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the static frontend portfolio can communicate with this backend
app.use(cors({
    origin: '*', // Allows local file:// protocol submissions and testing
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Diagnostic status endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: "ONLINE", service: "SECURE_MAIL_GATEWAY", version: "1.0.0" });
});

// Mail delivery route
app.post('/api/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Validate inputs
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: "Missing required packet payload parameters." });
    }
    
    // Create Nodemailer transporter
    // For local testing/hosting, configure SMTP settings in the .env file.
    // Gmail requires an "App Password" (details provided in the instructions).
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your sending email (e.g. priscillamuthaiah@gmail.com)
            pass: process.env.EMAIL_PASS  // Your secure Gmail App Password (16 letters, no spaces)
        }
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: 'priscillamuthaiah@gmail.com', // Your target inbox
        replyTo: email, // Sets reply-to to the visitor's email
        subject: `[PORTFOLIO CONTACT] ${subject}`,
        text: `SENDER IDENTIFIER: ${name}\nRETURN EMAIL: ${email}\n\nMESSAGE PAYLOAD:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Secure packet transmitted successfully." });
    } catch (error) {
        console.error('Mail delivery failure:', error);
        res.status(500).json({ success: false, message: "SMTP server handshake failed.", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[OK] SECURE_MAIL_GATEWAY online on port ${PORT}`);
    console.log(`[INFO] Server targets environment variables: EMAIL_USER and EMAIL_PASS`);
});
