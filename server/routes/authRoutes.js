const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const { registerUser, loginUser, sendOTP, googleLogin } = require('../controllers/authController');
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/google', googleLogin);

<<<<<<< HEAD
// Profile
router.get('/me', protect, getMe);
router.put('/profile', protect, updateMyProfile);
router.get('/users/:identifier', protect, getUserProfile);

=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
module.exports = router;
