<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { sendInviteEmail } = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendInviteEmail);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const { sendInviteEmail } = require('../controllers/inviteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendInviteEmail);

module.exports = router;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
