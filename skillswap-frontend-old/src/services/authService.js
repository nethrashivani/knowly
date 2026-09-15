import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

export const register = async (data) => {
    const response = await axios.post(
        `${BASE_URL}/register`,
        data
    );

    return response.data;
};

export const verifyOtp = async (data) => {
    const response = await axios.post(
        `${BASE_URL}/verify-otp`,
        data
    );

    return response.data;
};

export const resendOtp = async (data) => {
    const response = await axios.post(
        `${BASE_URL}/resend-otp`,
        data
    );

    return response.data;
};

export const login = async (data) => {
    const response = await axios.post(
        `${BASE_URL}/login`,
        data
    );

    return response.data;
};

// Save token to localStorage
export const saveAuth = (authResponse) => {
    localStorage.setItem('token', authResponse.token);

    localStorage.setItem(
        'user',
        JSON.stringify({
            name: authResponse.name,
            email: authResponse.email,
            role: authResponse.role
        })
    );
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUser = () => {
    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => {
    return !!localStorage.getItem('token');
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};