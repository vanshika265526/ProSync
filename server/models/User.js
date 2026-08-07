const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
        // --- Public profile fields ---
        avatar: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        isGoogleUser: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
