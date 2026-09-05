import { api } from './api';

export const authService = {
  register: (payload) => api.post('/api/auth/register', payload),
  register_sch: (payload) => api.post('/api/auth/register_sch', payload),
  verifyEmail: (payload) => api.post('/api/auth/verify-email', payload),
  resendVerification: (payload) => api.post('/api/auth/resend-verification', payload),
  login: (payload) => api.post('/api/auth/login', payload),
  forgotPassword: (payload) => api.post('/api/auth/forgot-password', payload),
  verifyResetOtp: (payload) => api.post('/api/auth/verify-reset-otp', payload),
  resetPassword: (payload) => api.post('/api/auth/reset-password', payload),
  getCurrentProfile: () => api.get('/api/profiles/me'),
};
