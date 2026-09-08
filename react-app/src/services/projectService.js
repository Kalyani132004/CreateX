import api from './api';

export const projectService = {
  list: (params) => api.get('/projects/', { params }), // { q, domain, technology, course, batch, sort, page }
  detail: (id) => api.get(`/projects/${id}/`),
  create: (formData) =>
    api.post('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) => api.patch(`/projects/${id}/`, formData),
  remove: (id) => api.delete(`/projects/${id}/`),

  myProjects: () => api.get('/projects/mine/'),

  wishlist: {
    list: () => api.get('/wishlist/'),
    add: (projectId) => api.post('/wishlist/', { project: projectId }),
    remove: (projectId) => api.delete(`/wishlist/${projectId}/`),
  },

  feedback: {
    listForProject: (projectId) => api.get(`/projects/${projectId}/feedback/`),
    submit: (projectId, payload) =>
      api.post(`/projects/${projectId}/feedback/`, payload), // { rating, feedback, recommendation }
  },
};
