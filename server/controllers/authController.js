<<<<<<< HEAD
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Project = require('../models/Project');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { publicProfile, privateProfile } = require('../utils/userProfile');
const events = require('../services/eventService');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Announce a sign-in on every project the user belongs to.
 *
 * Feed-only: a login is interesting for five minutes, so it never becomes a
 * history row and never notifies anyone. Fire-and-forget so a slow write
 * can't delay the login response.
 */
const announceLogin = (user) => {
    Project.find({ $or: [{ user: user._id }, { 'team.email': user.email }] })
        .select('_id')
        .lean()
        .then((projects) =>
            Promise.all(
                projects.map((p) =>
                    events.recordActivity({
                        project: p._id,
                        actor: user,
                        action: 'user_login',
                        description: 'Signed in',
                        category: 'member',
                    })
                )
            )
        )
        .catch((error) => console.error('[Auth] login activity failed:', error.message));
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
        res.status(400);
        throw new Error('Please add all fields including OTP');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // Delete OTP after successful registration
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            ...privateProfile(user),
            token: generateToken(user._id),
            message: 'User registered successfully.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        announceLogin(user);
        res.json({
            ...privateProfile(user),
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB (expires in 10 mins via TTL index)
    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, returnDocument: 'after' }
    );

    // Email content
    const mailOptions = {
        from: `ProSync <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your ProSync Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6200EA; text-align: center;">ProSync Verification</h2>
                <p>Hello,</p>
                <p>Use the following code to complete your signup process:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #6200EA; border-radius: 5px;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 20px;">This code will expire in 10 minutes.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500);
        throw new Error('Failed to send OTP email. Check SMTP configuration.');
    }
});

// @desc    Google login/signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
        res.status(400);
        throw new Error('Google credential or access token is required');
    }

    let email, name;

    try {
        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else {
            // Using access token to fetch user info
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();

            if (!data.email) {
                res.status(401);
                throw new Error('Invalid Google access token');
            }

            email = data.email;
            name = data.name;
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user for first-time Google login
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-10),
                isGoogleUser: true,
            });
        }

        announceLogin(user);

        res.status(200).json({
            ...privateProfile(user),
            token: generateToken(user._id),
            message: 'Google login successful'
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401);
        throw new Error('Invalid Google credential or token');
    }
});

// @desc    Get the logged-in user's own full profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(privateProfile(user));
});

// @desc    Update the logged-in user's own profile
// @route   PUT /api/auth/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Only these fields may ever be self-edited. Email/password/role are not editable here.
    const { name, avatar, title, bio, location, skills } = req.body;

    if (typeof name === 'string') {
        const trimmed = name.trim();
        if (!trimmed) {
            res.status(400);
            throw new Error('Name cannot be empty');
        }
        user.name = trimmed;
    }
    if (typeof avatar === 'string') user.avatar = avatar.trim();
    if (typeof title === 'string') user.title = title.trim();
    if (typeof bio === 'string') user.bio = bio;
    if (typeof location === 'string') user.location = location.trim();
    if (Array.isArray(skills)) {
        user.skills = skills
            .map(s => (typeof s === 'string' ? s.trim() : ''))
            .filter(Boolean)
            .slice(0, 30);
    }

    await user.save();

    // Keep denormalised copies inside project teams in sync so the members list
    // shows the updated name/avatar without needing a re-join.
    await Project.updateMany(
        { 'team.email': user.email },
        {
            $set: {
                'team.$[m].name': user.name,
                'team.$[m].avatar': user.avatar,
            },
        },
        { arrayFilters: [{ 'm.email': user.email }] }
    );

    res.status(200).json(privateProfile(user));
});

// @desc    Get another user's public profile by id or email
// @route   GET /api/auth/users/:identifier
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    let user = null;

    // 1. Try as a Mongo id
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        user = await User.findById(identifier).select('-password');
    }

    // 2. Try as an email. Emails are stored as typed, so match case-insensitively
    //    rather than assuming they were lower-cased at signup.
    if (!user && identifier.includes('@')) {
        const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        user = await User.findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } }).select('-password');
    }

    // 3. Fall back to the denormalised copy inside a shared project's team array,
    //    so members who were invited by email but haven't signed up yet still
    //    render a basic profile instead of an error.
    if (!user) {
        // Only look inside projects the requester is actually part of.
        const myProjects = await Project.find({
            $or: [{ user: req.user._id }, { 'team.email': req.user.email }],
        });

        const member = myProjects
            .flatMap(p => p.team || [])
            .find(
                m =>
                    String(m.id) === String(identifier) ||
                    String(m._id) === String(identifier) ||
                    (m.email && m.email.toLowerCase() === String(identifier).toLowerCase())
            );

        if (member) {
            return res.status(200).json({
                _id: member.id || member._id,
                id: member.id || member._id,
                name: member.name,
                email: member.email,
                avatar: member.avatar,
                title: '',
                bio: '',
                location: '',
                skills: [],
                joinedDate: null,
                pendingInvite: true,
            });
        }
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // A user asking about themselves gets the private view.
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(200).json(privateProfile(user));
    }

    res.status(200).json(publicProfile(user));
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    sendOTP,
    googleLogin,
    getMe,
    updateMyProfile,
    getUserProfile,
};
=======
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
        res.status(400);
        throw new Error('Please add all fields including OTP');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // Delete OTP after successful registration
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            token: generateToken(user._id),
            message: 'User registered successfully.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB (expires in 10 mins via TTL index)
    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, returnDocument: 'after' }
    );

    // Email content
    const mailOptions = {
        from: `ProSync <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your ProSync Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6200EA; text-align: center;">ProSync Verification</h2>
                <p>Hello,</p>
                <p>Use the following code to complete your signup process:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #6200EA; border-radius: 5px;">
                    ${otp}
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 20px;">This code will expire in 10 minutes.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500);
        throw new Error('Failed to send OTP email. Check SMTP configuration.');
    }
});

// @desc    Google login/signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
        res.status(400);
        throw new Error('Google credential or access token is required');
    }

    let email, name;

    try {
        if (credential) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } else {
            // Using access token to fetch user info
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();

            if (!data.email) {
                res.status(401);
                throw new Error('Invalid Google access token');
            }

            email = data.email;
            name = data.name;
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user for first-time Google login
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-10),
                isGoogleUser: true,
            });
        }

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            token: generateToken(user._id),
            message: 'Google login successful'
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401);
        throw new Error('Invalid Google credential or token');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    sendOTP,
    googleLogin,
};
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
