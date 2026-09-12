import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'http://localhost:8080/api/skill-interests';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

export const expressInterest = async (skillId) => {
  await axios.post(
    `${BASE_URL}/skill/${skillId}`,
    {},
    authHeaders()
  );
};

export const removeInterest = async (skillId) => {
  await axios.delete(
    `${BASE_URL}/skill/${skillId}`,
    authHeaders()
  );
};

export const getInterestCount = async (skillId) => {
  const response = await axios.get(
    `${BASE_URL}/skill/${skillId}/count`,
    authHeaders()
  );

  return response.data;
};

export const getInterestedLearners = async (skillId) => {
  const response = await axios.get(
    `${BASE_URL}/skill/${skillId}/learners`,
    authHeaders()
  );

  return response.data;
};

export const isInterested = async (skillId) => {
  const response = await axios.get(
    `${BASE_URL}/skill/${skillId}/status`,
    authHeaders()
  );

  return response.data;
};