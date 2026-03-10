import axios from 'axios';
const API_URL = 'http://localhost:5001/api/auth';

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

const authService = {
    register,
    login,
    logout,
    sendOTP,
    googleLogin,
};
export default authService;
