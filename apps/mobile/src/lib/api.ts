import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://metrivaapi-production.up.railway.app/api';

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

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = useAuthStore.getState().refreshToken;

      if (!storedRefreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh', {
          refreshToken: storedRefreshToken,
        });
        const newAccessToken = data.data?.tokens?.accessToken;
        const newRefreshToken = data.data?.refreshToken;

        useAuthStore.getState().setAccessToken(newAccessToken);
        if (newRefreshToken) useAuthStore.getState().setRefreshToken(newRefreshToken);

        processQueue(null, newAccessToken);
        originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const propertiesApi = {
  search: (params: Record<string, unknown>) =>
    api.get('/properties', { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/properties/${id}`).then((r) => r.data),
  getFeatured: () => api.get('/properties/featured').then((r) => r.data),
  getMine: () => api.get('/properties/mine').then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/properties', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/properties/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/properties/${id}`).then((r) => r.data),
  toggleSave: (id: string) => api.post(`/properties/${id}/save`).then((r) => r.data),
  getSaved: () => api.get('/properties/saved').then((r) => r.data),
  uploadImages: (id: string, formData: FormData) =>
    api.post(`/properties/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};

export const authApi = {
  register: (data: unknown) => api.post('/auth/register', data).then((r) => r.data),
  login: (data: unknown) => api.post('/auth/login', data).then((r) => r.data),
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }).then((r) => r.data),
  verifyOtp: (phone: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, otp }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};

export const searchApi = {
  suggestions: (q: string) =>
    api.get('/search/suggestions', { params: { q } }).then((r) => r.data),
  nearby: (lat: number, lng: number, radius?: number) =>
    api.get('/search/nearby', { params: { lat, lng, radius } }).then((r) => r.data),
};

export const aiApi = {
  getTrustScore: (propertyId: string) =>
    api.get(`/ai/trust-score/${propertyId}`).then((r) => r.data),
  getLocalityInsights: (localityId: string) =>
    api.get(`/ai/locality-insights/${localityId}`).then((r) => r.data),
};

export const usersApi = {
  getMe: () => api.get('/users/me').then((r) => r.data),
  updateMe: (data: unknown) => api.patch('/users/me', data).then((r) => r.data),
};

export const paymentsApi = {
  createFeaturedOrder: (propertyId: string, duration: string) =>
    api.post('/payments/featured/create-order', { propertyId, duration }).then((r) => r.data),
  createSubscriptionOrder: (plan: string) =>
    api.post('/payments/subscription/create-order', { plan }).then((r) => r.data),
  verifyPayment: (data: unknown) => api.post('/payments/verify', data).then((r) => r.data),
  getHistory: () => api.get('/payments/history').then((r) => r.data),
};
