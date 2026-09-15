import axios from 'axios';
import { getToken } from './authService';

const BASE_URL =
  'http://localhost:8080/api/workshop-applications';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getMyApplications = async () => {
  const response = await axios.get(
    `${BASE_URL}/my`,
    authHeaders()
  );

  return response.data;
};