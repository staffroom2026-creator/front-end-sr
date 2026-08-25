import { api } from './api';

export const featureService = {
  getSavedJobs: () => api.get('/features/saved-jobs'),
  saveJob: (jobId) => api.post(`/features/saved-jobs/${jobId}`),
  deleteSavedJob: (jobId) => api.delete(`/features/saved-jobs/${jobId}`),
  getNotifications: () => api.get('/features/notifications'),
  markNotificationRead: (notificationId) => api.patch(`/features/notifications/${notificationId}/read`),
};
