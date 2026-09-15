import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'https://knowly-lphd.onrender.com/api/workshop-applications';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const getMyApplications = async () => {
  const response = await axios.get(`${BASE_URL}/my`, authHeaders());
  return response.data;
};

export const getWorkshopApplications = async (workshopId) => {
  const response = await axios.get(`${BASE_URL}/workshop/${workshopId}`, authHeaders());
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axios.put(
    `${BASE_URL}/${applicationId}/status?status=${status}`,
    {},
    authHeaders()
  );
  return response.data;
};
