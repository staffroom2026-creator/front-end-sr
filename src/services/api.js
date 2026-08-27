import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.staffroomng.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = () => {
  const sessionToken = sessionStorage.getItem('staffroom_token');
  if (sessionToken) return sessionToken;

  const legacyToken = localStorage.getItem('staffroom_token');
  if (legacyToken) {
    sessionStorage.setItem('staffroom_token', legacyToken);
    localStorage.removeItem('staffroom_token');
    return legacyToken;
  }

  return null;
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const apiErrorMessage = (error, fallback = 'Something went wrong.') => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

  if (typeof backendMessage === 'string') {
    return backendMessage;
  }

  if (backendMessage && typeof backendMessage === 'object') {
    return Object.values(backendMessage)[0] || fallback;
  }

  return fallback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      sessionStorage.removeItem('staffroom_token');
      sessionStorage.removeItem('staffroom_user');
      localStorage.removeItem('staffroom_token');
      localStorage.removeItem('staffroom_user');
      localStorage.removeItem('staffroom_verification_email');

      const currentPath = window.location.pathname;
      const authPages = ['/signin', '/signup', '/verify-email'];

      if (!authPages.includes(currentPath)) {
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);

export const unwrapResponse = (response) => response?.data ?? {};
export const getApiData = (response) => unwrapResponse(response)?.data ?? unwrapResponse(response) ?? {};
