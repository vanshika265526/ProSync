import axios from 'axios';
<<<<<<< HEAD
import { API_BASE } from './apiClient';
const API_URL = `${API_BASE}/auth`;
=======
const API_URL = 'http://localhost:5001/api/auth';
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

// Send OTP
const sendOTP = async (email) => {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data;
};

// Register user
const register = async (userData) => {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
};
// Login user
const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

const googleLogin = async (credential, accessToken) => {
    const response = await axios.post(`${API_URL}/google`, { credential, accessToken });
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

<<<<<<< HEAD
const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// Get the logged-in user's own full profile
const getMe = async (token) => {
    const response = await axios.get(`${API_URL}/me`, authConfig(token));
    return response.data;
};

// Update the logged-in user's own profile
const updateProfile = async (profileData, token) => {
    const response = await axios.put(`${API_URL}/profile`, profileData, authConfig(token));
    return response.data;
};

// Get any user's public profile by id or email
const getUserProfile = async (identifier, token) => {
    const response = await axios.get(
        `${API_URL}/users/${encodeURIComponent(identifier)}`,
        authConfig(token)
    );
    return response.data;
};

=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
const authService = {
    register,
    login,
    logout,
    sendOTP,
    googleLogin,
<<<<<<< HEAD
    getMe,
    updateProfile,
    getUserProfile,
=======
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
};
export default authService;
