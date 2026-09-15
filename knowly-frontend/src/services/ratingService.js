import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'https://knowly-lphd.onrender.com/api/ratings';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getRatingsForUser = async (userId) => {
  const response = await axios.get(`${BASE_URL}/user/${userId}`);
  return response.data;
};

export const getRatingsForWorkshop = async (workshopId) => {
  const response = await axios.get(`${BASE_URL}/workshop/${workshopId}`);
  return response.data;
};

export const getMyRatingForWorkshop = async (workshopId) => {
  const response = await axios.get(`${BASE_URL}/workshop/${workshopId}/mine`, authHeaders());
  return response.data;
};

export const createRating = async (ratingData) => {
  const response = await axios.post(BASE_URL, ratingData, authHeaders());
  return response.data;
};