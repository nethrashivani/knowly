import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'https://knowly-lphd.onrender.com/api/rooms';
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getMyRooms = async () => {
  const response = await axios.get(`${BASE_URL}/my`, authHeaders());
  return response.data;
};

export const createRoom = async (name) => {
  const response = await axios.post(BASE_URL, { name }, authHeaders());
  return response.data;
};

export const joinRoom = async (code) => {
  const response = await axios.post(`${BASE_URL}/join`, { code }, authHeaders());
  return response.data;
};

export const switchRoom = async (roomId) => {
  const response = await axios.put(`${BASE_URL}/${roomId}/active`, {}, authHeaders());
  return response.data;
};

export const leaveRoom = async (roomId) => {
  await axios.delete(`${BASE_URL}/${roomId}/memberships`, authHeaders());
};

export const deleteRoom = async (roomId) => {
  await axios.delete(`${BASE_URL}/${roomId}`, authHeaders());
};
