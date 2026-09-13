import { api } from './api';

export const contactService = {
  submitMessage: (payload) => api.post('/api/contact', payload),
};