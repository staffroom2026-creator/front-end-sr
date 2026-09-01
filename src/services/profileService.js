import { api } from './api';

export const profileService = {
  getMe: () => api.get('/api/profiles/me'),
  updateTeacher: (payload) => api.put('/api/profiles/teacher', payload),
  updateSchool: (payload) => api.put('/api/profiles/school', payload),
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
