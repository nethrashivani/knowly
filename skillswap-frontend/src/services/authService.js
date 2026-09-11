import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

export const register = async (data) => {
    const response = await axios.post(`${BASE_URL}/register`, data);
    return response.data;
};

export const login = async (data) => {
    const response = await axios.post(`${BASE_URL}/login`, data);
    return response.data;
};

// Save token to localStorage
export const saveAuth = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify({
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role
    }));
};

export const getToken = () => localStorage.getItem('token');
export const getUser = () => JSON.parse(localStorage.getItem('user'));
export const isLoggedIn = () => !!localStorage.getItem('token');
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};