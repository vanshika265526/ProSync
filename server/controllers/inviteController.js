const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const { clientUrl } = require('../config/cors');

// @desc    Send invitation email
// @route   POST /api/invite/send
// @access  Private
const sendInviteEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const senderName = req.user.name;

    if (!email) {
        res.status(400);
        throw new Error('Please include a target email');
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

    // Must point at the frontend, not the API host — CLIENT_URL is the
    // deployed app's origin (see config/cors.js).
    const referralLink = `${clientUrl()}/signup?ref=${req.user._id}`;

    const mailOptions = {
        from: `ProSync Team <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${senderName} invited you to join ProSync`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ed21df; text-align: center;">You're Invited!</h2>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    <p style="font-size: 16px; color: #334155;"><strong>${senderName}</strong> has invited you to collaborate on <strong>ProSync</strong>.</p>
                </div>
                <div style="text-align: center; margin-bottom: 30px;">
                    <p style="color: #64748b; margin-bottom: 20px;">Join your team and start building the future of UI together.</p>
                    <a href="${referralLink}" style="background: #00F2EA; color: #020617; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Accept Invitation</a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${referralLink}" style="color: #00F2EA;">${referralLink}</a>
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Invitation sent successfully!' });
    } catch (error) {
        console.error('Invite Email Error:', error);
        res.status(500);
        throw new Error('Failed to send invitation. Please try again later.');
    }
});

module.exports = {
    sendInviteEmail,
};
