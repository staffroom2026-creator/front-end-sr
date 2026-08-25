import { api } from './api';

export const profileService = {
  getMe: () => api.get('/profiles/me'),
  updateTeacher: (payload) => api.put('/profiles/teacher', payload),
  updateSchool: (payload) => api.put('/profiles/school', payload),
  uploadCv: (formData) =>
    api.post('/profiles/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadLogo: (formData) =>
    api.post('/profiles/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
