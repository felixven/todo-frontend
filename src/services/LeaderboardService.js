import axios from 'axios'
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; 
const BASE_REST_API_URL = `${API_BASE}/api/todos`;

  axios.interceptors.request.use(
  (config) => {
    const raw = getToken(); 
    if (raw) {
      const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCollabBoard = () => axios.get(`${BASE_REST_API_URL}/leaderboard/collab`);
export const getCollabDetails = (userId) =>
    axios.get(`${BASE_REST_API_URL}/leaderboard/collab/${userId}/items`);
export const getFinisherBoardById = () => axios.get(`${BASE_REST_API_URL}/leaderboard/finish-by-id`);
export const getFinisherDetailsByUserId = (userId) =>axios.get(`${BASE_REST_API_URL}/leaderboard/finish/${userId}/todos-by-id`)
