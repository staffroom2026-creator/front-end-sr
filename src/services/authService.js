import { api } from './api';

export const authService = {
  register: (payload) => {
    const endpoint = payload?.role === 'school' ? '/auth/register_sch' : '/auth/register';
    return api.post(endpoint, payload);
  },
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  resendVerification: (payload) => api.post('/auth/resend-verification', payload),
  login: (payload) => api.post('/auth/login', payload),
  forgotPassword: (payload) => api.post('/auth/forgetPassword', payload),
  resetPassword: (payload) => api.post('/auth/resetPassword', payload),
  getCurrentProfile: () => api.get('/profiles/me'),
};
