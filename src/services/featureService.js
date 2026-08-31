import { api } from './api';

export const featureService = {
  getSavedJobs: () => api.get('/api/features/saved-jobs'),
  saveJob: (jobId) => api.post(`/api/features/saved-jobs/${jobId}`),
  deleteSavedJob: (jobId) => api.delete(`/api/features/saved-jobs/${jobId}`),
  getNotifications: () => api.get('/api/features/notifications'),
  markNotificationRead: (notificationId) => api.patch(`/api/features/notifications/${notificationId}/read`),
};
