<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../controllers/supportController');

router.post('/message', sendSupportEmail);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../controllers/supportController');

router.post('/message', sendSupportEmail);

module.exports = router;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
