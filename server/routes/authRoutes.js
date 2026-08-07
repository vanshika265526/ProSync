const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    sendOTP,
    googleLogin,
    getMe,
    updateMyProfile,
    getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/google', googleLogin);

// Profile
router.get('/me', protect, getMe);
router.put('/profile', protect, updateMyProfile);
router.get('/users/:identifier', protect, getUserProfile);

module.exports = router;
