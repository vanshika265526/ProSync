const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendOTP, googleLogin } = require('../controllers/authController');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/google', googleLogin);

module.exports = router;
