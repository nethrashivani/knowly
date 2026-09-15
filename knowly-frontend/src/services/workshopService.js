import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'https://knowly-lphd.onrender.com/api/workshops';
const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getAllWorkshops = async () => {
  const response = await axios.get(BASE_URL, authHeaders());
  return response.data;
};

export const getWorkshopById = async (workshopId) => {
  const response = await axios.get(`${BASE_URL}/${workshopId}`, authHeaders());
  return response.data;
};

export const getMyWorkshops = async () => {
  const response = await axios.get(`${BASE_URL}/my`, authHeaders());
  return response.data;
};

export const getWorkshopsByTeacher = async (teacherId) => {
  const response = await axios.get(`${BASE_URL}/teacher/${teacherId}`);
  return response.data;
};

export const createWorkshop = async (workshopData) => {
  const response = await axios.post(BASE_URL, workshopData, authHeaders());
  return response.data;
};

export const deleteWorkshop = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`, authHeaders());
};

export const applyForWorkshop = async (workshopId) => {
  const response = await axios.post(`https://knowly-lphd.onrender.com/api/workshop-applications/workshop/${workshopId}`, {}, authHeaders());
  return response.data;
};
