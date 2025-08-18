import axios from 'axios'
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; // 例：http://localhost:8080 或 https://your-api.com
const BASE_REST_API_URL = `${API_BASE}/api/todos`;

  axios.interceptors.request.use(
  (config) => {
    const raw = getToken(); // 可能是 "xxx" 或 "Bearer xxx"
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

// 完成者榜（ID 版）
export const getFinisherBoardById = () => axios.get(`${BASE_REST_API_URL}/leaderboard/finish-by-id`);
export const getFinisherDetailsByUserId = (userId) =>axios.get(`${BASE_REST_API_URL}/leaderboard/finish/${userId}/todos-by-id`)
