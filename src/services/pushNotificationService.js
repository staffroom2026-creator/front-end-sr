import { api } from './api';

export const pushNotificationService = {
  getPublicKey: () => api.get('/api/push/vapid-key'),
  saveSubscription: (subscription) => api.post('/api/push/subscriptions', subscription),
  removeSubscription: (endpoint) => api.delete('/api/push/subscriptions', {
    data: { endpoint },
  }),
};
