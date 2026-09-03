import { api } from './api';

export const featureService = {
  getSavedJobs: () => api.get('/api/features/saved-jobs'),
  saveJob: (jobId) => api.post(`/api/features/saved-jobs/${jobId}`),
  deleteSavedJob: (jobId) => api.delete(`/api/features/saved-jobs/${jobId}`),
  getSavedTeachers: () => api.get('/api/features/saved-teachers'),
  saveTeacher: (teacherUserId) => api.post(`/api/features/saved-teachers/${teacherUserId}`),
  deleteSavedTeacher: (teacherUserId) => api.delete(`/api/features/saved-teachers/${teacherUserId}`),
  getJobAlerts: () => api.get('/api/features/job-alerts'),
  updateJobAlerts: (payload) => api.put('/api/features/job-alerts', payload),
  patchJobAlerts: (payload) => api.patch('/api/features/job-alerts', payload),
  getNotifications: (params = {}) => api.get('/api/features/notifications', { params }),
  markNotificationRead: (notificationId) => api.patch(`/api/features/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) => api.delete(`/api/features/notifications/${notificationId}`),
};
