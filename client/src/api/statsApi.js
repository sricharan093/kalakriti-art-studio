import api from './axios.js';

export const statsApi = {
  getCustomerStats: async () => {
    const res = await api.get('/customer/stats');
    return res.data;
  },
  getAdminStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  }
};
