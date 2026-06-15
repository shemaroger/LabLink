import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry on login or refresh endpoints
    if (
      originalRequest.url?.includes('/login/') ||
      originalRequest.url?.includes('/token/refresh/')
    ) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');

        if (!refresh) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${API_URL}/users/token/refresh/`,
          { refresh }
        );

        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        api.defaults.headers.common['Authorization'] =
          `Bearer ${newAccess}`;
        originalRequest.headers['Authorization'] =
          `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;