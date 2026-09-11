import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'http://localhost:8080/api/ratings';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getRatingsForUser = async (userId) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}`);
  return response.data;
};

export const createRating = async (ratingData) => {
  const response = await axios.post(
    BASE_URL,
    ratingData,
    authHeaders()
  );
  return response.data;
};