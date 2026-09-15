import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'http://localhost:8080/api/profile';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getMyProfile = async () => {
  const response = await axios.get(`${BASE_URL}/me`, authHeaders());
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await axios.put(
    `${BASE_URL}/me`,
    profileData,
    authHeaders()
  );
  return response.data;
};