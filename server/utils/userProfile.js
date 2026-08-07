// Shared helpers for shaping user profile payloads.

const defaultAvatar = (name = 'User') =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7D00FF&color=fff`;

// Everything that is safe for ANY authenticated user to see about another user.
const publicProfile = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || defaultAvatar(user.name),
        title: user.title || '',
        bio: user.bio || '',
        location: user.location || '',
        skills: Array.isArray(user.skills) ? user.skills : [],
        joinedDate: user.createdAt || null,
    };
};

// Public profile + private fields only the owner of the account should get.
const privateProfile = (user) => {
    if (!user) return null;
    return {
        ...publicProfile(user),
        onboardingComplete: user.onboardingComplete,
        isGoogleUser: !!user.isGoogleUser,
    };
};

module.exports = { publicProfile, privateProfile, defaultAvatar };
