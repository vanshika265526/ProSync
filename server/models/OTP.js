<<<<<<< HEAD
const mongoose = require('mongoose');

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // 5 minutes in seconds
        },
    }
);

module.exports = mongoose.model('OTP', otpSchema);
=======
const mongoose = require('mongoose');

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // 5 minutes in seconds
        },
    }
);

module.exports = mongoose.model('OTP', otpSchema);
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
