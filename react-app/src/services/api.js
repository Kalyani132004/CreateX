// ============================================================================
// Axios base client — talks to the Django REST Framework backend (via the
// gateway). All API calls in the app go through this layer; components
// never call axios directly. Swap VITE_API_BASE_URL in your .env per
// environment.
// ============================================================================

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A second, interceptor-free instance used ONLY to redeem the refresh
// token. If this used `api` instead, a failed refresh would trigger the
// response interceptor again and loop forever.
const rawApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Ensures concurrent 401s only trigger one refresh call, not one per request.
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('cx_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  if (!refreshPromise) {
    refreshPromise = rawApi
      .post('/auth/student/refresh/', { refresh_token: refreshToken })
      .then((res) => {
        localStorage.setItem('cx_token', res.data.access_token);
        return res.data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// Handle API errors, with automatic refresh-and-retry on an expired token
api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;
    const httpStatus = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/student/login') ||
      originalRequest?.url?.includes('/auth/student/register') ||
      originalRequest?.url?.includes('/auth/student/refresh') ||
      originalRequest?.url?.includes('/auth/faculty/login');

    if (httpStatus === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('cx_token');
        localStorage.removeItem('cx_refresh_token');
        return Promise.reject({
          status: 401,
          message: 'Your session has expired. Please log in again.',
          raw: null,
        });
      }
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      status: httpStatus,
      message,
      raw: error.response?.data,
    });
  },
);

export default api;
