const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

// @desc    Send support email
// @route   POST /api/support/message
// @access  Public
const sendSupportEmail = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        res.status(400);
        throw new Error('Please include all fields');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `ProSync Support <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Send to the support email (self)
        subject: `Support Inquiry: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #00F2EA; text-align: center;">New Support Message</h2>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                </div>
                <div style="line-height: 1.6; color: #334155;">
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `,
        replyTo: email
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Support message sent successfully!' });
    } catch (error) {
        console.error('Support Email Error:', error);
        res.status(500);
        throw new Error('Failed to send support message. Please try again later.');
    }
});

module.exports = {
    sendSupportEmail,
};
