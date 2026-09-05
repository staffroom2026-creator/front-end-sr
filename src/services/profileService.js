import { api } from './api';

export const profileService = {
  getMe: () => api.get('/api/profiles/me'),
  updateTeacher: (payload) => api.put('/api/profiles/teacher', payload),
  updateSchool: (payload) => api.put('/api/profiles/school', payload),
  createEducation: (payload) => api.post('/api/profiles/teacher/education', payload),
  getEducation: () => api.get('/api/profiles/teacher/education'),
  updateEducation: (educationId, payload) => api.put(`/api/profiles/teacher/education/${educationId}`, payload),
  patchEducation: (educationId, payload) => api.patch(`/api/profiles/teacher/education/${educationId}`, payload),
  deleteEducation: (educationId) => api.delete(`/api/profiles/teacher/education/${educationId}`),
  createExperience: (payload) => api.post('/api/profiles/teacher/experience', payload),
  getExperience: () => api.get('/api/profiles/teacher/experience'),
  updateExperience: (experienceId, payload) => api.put(`/api/profiles/teacher/experience/${experienceId}`, payload),
  patchExperience: (experienceId, payload) => api.patch(`/api/profiles/teacher/experience/${experienceId}`, payload),
  deleteExperience: (experienceId) => api.delete(`/api/profiles/teacher/experience/${experienceId}`),
  inviteTeacher: (teacherUserId, payload = {}) => api.post(`/api/teachers/${teacherUserId}/invite`, payload),
  uploadCv: (formData) =>
    api.post('/api/profiles/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadLogo: (formData) =>
    api.post('/api/profiles/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
