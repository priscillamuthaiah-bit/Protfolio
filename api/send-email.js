const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Enable CORS headers for cross-origin requests (e.g. from GitHub Pages)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { name, email, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Missing required parameters.' });
    }

    // Configure Nodemailer transporter using Gmail App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: 'priscillamuthaiah@gmail.com',
        replyTo: email,
        subject: `[PORTFOLIO CONTACT] ${subject}`,
        text: `SENDER IDENTIFIER: ${name}\nRETURN EMAIL: ${email}\n\nMESSAGE PAYLOAD:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Secure email sent successfully.' });
    } catch (error) {
        console.error('SMTP Delivery error:', error);
        return res.status(500).json({ success: false, message: 'SMTP server handshake failed.', error: error.message });
    }
};
