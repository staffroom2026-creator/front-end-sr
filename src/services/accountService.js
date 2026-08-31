import { api } from './api';

export const accountService = {
  getProfile: () => api.get('/api/account/profile'),
  updateProfile: (payload) => api.put('/api/account/profile', payload),
  patchProfile: (payload) => api.patch('/api/account/profile', payload),
  updatePassword: (payload) => api.post('/api/account/password', payload),
  getPreferences: () => api.get('/api/account/preferences'),
  updatePreferences: (payload) => api.put('/api/account/preferences', payload),
  patchPreferences: (payload) => api.patch('/api/account/preferences', payload),
  updateEmail: (payload) => api.post('/api/account/email', payload),
  patchEmail: (payload) => api.patch('/api/account/email', payload),
  deleteAccount: (payload = {}) => api.delete('/api/auth/delete-account', { data: payload }),
};
