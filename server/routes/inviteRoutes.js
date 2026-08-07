const express = require('express');
const router = express.Router();
const { sendInviteEmail } = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendInviteEmail);

module.exports = router;
