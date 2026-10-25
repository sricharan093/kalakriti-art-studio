import api from './axios.js';

export const authApi = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getAdministrators: async () => {
    const res = await api.get('/auth/administrators');
    return res.data;
  },
  createAdministrator: async (adminData) => {
    const res = await api.post('/auth/administrators', adminData);
    return res.data;
  }
};
