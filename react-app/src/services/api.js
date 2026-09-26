// ============================================================================
// Axios base client
// Talks to the Django REST Framework backend through the API Gateway.
// All API calls in the React app should use this client.
// ============================================================================

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================================================
// Main API client
// ============================================================================

const api = axios.create({
  baseURL: BASE_URL,
});

// ============================================================================
// Refresh-token client
// Used only for refreshing the access token.
// No interceptors are attached to this instance.
// ============================================================================

const rawApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
//
// Adds:
// 1. JWT access token
// 2. JSON Content-Type for normal JavaScript objects
//
// IMPORTANT:
// If the request body is FormData, we DO NOT set Content-Type manually.
// The browser/Axios will automatically generate:
//
// multipart/form-data; boundary=----...
//
// This is required for image/file uploads.
// ============================================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cx_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --------------------------------------------------
    // FormData
    // --------------------------------------------------

    if (config.data instanceof FormData) {
      console.log('AXIOS: FormData request');

      // Let browser generate:
      // multipart/form-data; boundary=...

      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    } else {
      // --------------------------------------------------
      // JSON
      // --------------------------------------------------

      if (config.headers) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================================
// REFRESH TOKEN LOGIC
// ============================================================================

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('cx_refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // If another request is already refreshing the token,
  // wait for that same request instead of creating another one.
  if (!refreshPromise) {
    refreshPromise = rawApi
      .post('/auth/student/refresh/', {
        refresh_token: refreshToken,
      })
      .then((res) => {
        const newAccessToken = res.data.access_token;

        localStorage.setItem('cx_token', newAccessToken);

        return newAccessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// ============================================================================
// RESPONSE INTERCEPTOR
//
// Automatically refreshes the access token when API returns 401.
// ============================================================================

api.interceptors.response.use(
  // Successful response
  (response) => response,

  // Error response
  async (error) => {
    const originalRequest = error.config;
    const httpStatus = error.response?.status;

    // ----------------------------------------------------------
    // Prevent refresh loop for authentication endpoints
    // ----------------------------------------------------------

    const requestUrl = originalRequest?.url || '';

    const isAuthEndpoint =
      requestUrl.includes('/auth/student/login') ||
      requestUrl.includes('/auth/student/register') ||
      requestUrl.includes('/auth/student/refresh') ||
      requestUrl.includes('/auth/faculty/login');

    // ----------------------------------------------------------
    // Try refreshing token for 401
    // ----------------------------------------------------------

    if (
      httpStatus === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers = originalRequest.headers || {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // ------------------------------------------------------
        // Refresh failed → logout user
        // ------------------------------------------------------

        localStorage.removeItem('cx_token');
        localStorage.removeItem('cx_refresh_token');

        return Promise.reject({
          status: 401,
          message: 'Your session has expired. Please log in again.',
          raw: null,
        });
      }
    }

    // ----------------------------------------------------------
    // Extract backend error message
    // ----------------------------------------------------------

    const responseData = error.response?.data;

    let message =
      responseData?.detail ||
      responseData?.message ||
      'Something went wrong. Please try again.';

    // DRF validation errors can sometimes be objects.
    // Convert them into a readable message.
    if (typeof message !== 'string') {
      try {
        message = Object.entries(responseData || {})
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(', ')}`;
            }

            return `${field}: ${String(errors)}`;
          })
          .join(' | ');
      } catch {
        message = 'Something went wrong. Please try again.';
      }
    }

    // ----------------------------------------------------------
    // Return a consistent error object to React components
    // ----------------------------------------------------------

    return Promise.reject({
      status: httpStatus,
      message,
      raw: responseData,
    });
  },
);

export default api;
