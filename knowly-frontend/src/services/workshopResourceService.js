import axios from 'axios';
import { getToken } from './authService';

const BASE_URL =
  'http://https://knowly-lphd.onrender.com/api/workshop-resources';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const uploadResource = async (
  workshopId,
  title,
  file
) => {
  const formData = new FormData();

  formData.append('title', title);
  formData.append('file', file);

  const response = await axios.post(
    `${BASE_URL}/workshop/${workshopId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return response.data;
};

export const getWorkshopResources = async (workshopId) => {
  const response = await axios.get(
    `${BASE_URL}/workshop/${workshopId}`,
    authHeaders()
  );

  return response.data;
};

export const getResource = async (resourceId) => {
  const response = await axios.get(
    `${BASE_URL}/${resourceId}`,
    authHeaders()
  );

  return response.data;
};

export const getResourceDownloadUrl = (resourceId) => {
  return `${BASE_URL}/${resourceId}/download`;
};

export const downloadResource = async (resourceId) => {
  const response = await axios.get(
    `${BASE_URL}/${resourceId}/download`,
    {
      ...authHeaders(),
      responseType: 'blob'
    }
  );

  return response;
};

export const deleteResource = async (resourceId) => {
  await axios.delete(
    `${BASE_URL}/${resourceId}`,
    authHeaders()
  );
};