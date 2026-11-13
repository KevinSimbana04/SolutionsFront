import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      toast.warning('Su sesión ha caducado. Inicie sesión nuevamente.');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);