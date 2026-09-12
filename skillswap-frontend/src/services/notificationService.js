import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'http://localhost:8080/api/notifications';

const authHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

export const getMyNotifications = async () => {
    const response = await axios.get(
        BASE_URL,
        authHeaders()
    );

    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get(
        `${BASE_URL}/unread-count`,
        authHeaders()
    );

    return response.data;
};

export const markNotificationAsRead = async (id) => {
    await axios.put(
        `${BASE_URL}/${id}/read`,
        {},
        authHeaders()
    );
};