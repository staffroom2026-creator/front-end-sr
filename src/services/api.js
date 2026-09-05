import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://api.staffroomng.com';
const resolvedBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
export const API_ORIGIN = resolvedBaseUrl.replace(/\/$/, '');
export const API_BASE_URL = import.meta.env.DEV ? '' : resolvedBaseUrl.replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const STORE_KEYS = {
  token: 'staffroom_token',
  user: 'staffroom_user',
  verificationEmail: 'staffroom_verification_email',
};

const clearAuthState = (shouldRedirect = false) => {
  sessionStorage.removeItem(STORE_KEYS.token);
  sessionStorage.removeItem(STORE_KEYS.user);
  localStorage.removeItem(STORE_KEYS.token);
  localStorage.removeItem(STORE_KEYS.user);
  localStorage.removeItem(STORE_KEYS.verificationEmail);
  sessionStorage.removeItem(STORE_KEYS.verificationEmail);

  if (shouldRedirect) {
    const currentPath = window.location.pathname;
    const authPages = ['/signin', '/signup', '/verify-email'];

    if (!authPages.includes(currentPath)) {
      window.location.href = '/signin';
    }
  }
};

const getToken = () => {
  const sessionToken = sessionStorage.getItem(STORE_KEYS.token);
  if (sessionToken) return sessionToken;

  const legacyToken = localStorage.getItem(STORE_KEYS.token);
  if (legacyToken) {
    sessionStorage.setItem(STORE_KEYS.token, legacyToken);
    localStorage.removeItem(STORE_KEYS.token);
    return legacyToken;
  }

  return null;
};

const normalizeApiError = (error) => {
  const responseData = error?.response?.data ?? {};
  const errors = responseData?.errors ?? {};
  const message = responseData?.message ?? error?.message ?? 'Something went wrong.';
  const errorDetails = errors && typeof errors === 'object'
    ? Object.entries(errors)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
        .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ')
    : '';

  if (typeof message === 'string' && message.trim() && errorDetails) {
    return `${message}: ${errorDetails}`;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (errorDetails) {
    return errorDetails;
  }

  return 'Something went wrong.';
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.headers && config.headers['Content-Type'] === 'application/json' && config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    config.data = JSON.stringify(config.data);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthState(true);
    }

    if (status === 403) {
      const message = normalizeApiError(error);
      if (/expired|invalid token|unauthorized|missing token/i.test(message)) {
        clearAuthState(true);
      }
    }

    return Promise.reject(error);
  }
);

export const apiErrorMessage = (error, fallback = 'Something went wrong.') => {
  if (!error) return fallback;

  const responseData = error?.response?.data ?? {};
  const errors = responseData?.errors ?? {};
  const backendMessage = responseData?.message ?? error?.message ?? fallback;
  const errorDetails = errors && typeof errors === 'object'
    ? Object.entries(errors)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
        .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ')
    : '';

  if (typeof backendMessage === 'string' && backendMessage.trim() && errorDetails) {
    return `${backendMessage}: ${errorDetails}`;
  }

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage;
  }

  if (errorDetails) {
    return errorDetails;
  }

  return fallback;
};

export const normalizeApiResponse = (payload = {}) => ({
  success: Boolean(payload?.success ?? payload?.status ?? true),
  status: payload?.status ?? payload?.success ?? true,
  message: payload?.message ?? 'Request successful',
  data: payload?.data ?? payload ?? {},
  errors: payload?.errors ?? null,
});

export const unwrapResponse = (response) => response?.data ?? {};
export const getApiData = (response) => unwrapResponse(response)?.data ?? unwrapResponse(response) ?? {};
