
import api from './api';

export const authService = {
    //student login url
  studentLogin: (uniqueId, password) =>
    api.post('/auth/student/login/', { unique_id: uniqueId, password }),
  //faculty login url
  facultyLogin: (staffId, password) =>
    api.post('/auth/faculty/login/', { unique_id: staffId, password }),
  //student register url
  register: (payload) => api.post('/auth/student/register/', payload),
  // check the unique_id
  checkUniqueId: (uniqueId) =>
    api.get(`/auth/check-unique-id/`, { params: { unique_id: uniqueId } }),
  //logout url
  logout: () => api.post('/auth/logout/'),
  //password reset url
  changePassword: (payload) => api.post('/auth/change-password/', payload),
  //refresh url
  me: () => api.get('/auth/me/'),
};
