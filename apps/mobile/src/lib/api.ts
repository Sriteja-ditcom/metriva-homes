import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.metrivahomes.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const propertiesApi = {
  search: (params: Record<string, unknown>) => api.get('/properties', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/properties/${id}`).then((r) => r.data),
  getFeatured: () => api.get('/properties/featured').then((r) => r.data),
  toggleSave: (id: string) => api.post(`/properties/${id}/save`).then((r) => r.data),
  getSaved: () => api.get('/properties/saved').then((r) => r.data),
};

export const authApi = {
  login: (data: unknown) => api.post('/auth/login', data).then((r) => r.data),
  register: (data: unknown) => api.post('/auth/register', data).then((r) => r.data),
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }).then((r) => r.data),
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, otp }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};
