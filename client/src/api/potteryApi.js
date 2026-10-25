import api from './axios.js';

export const potteryApi = {
  getOptions: async () => {
    const res = await api.get('/pottery/options');
    return res.data;
  },
  createRequest: async (requestData) => {
    const res = await api.post('/pottery-requests', requestData);
    return res.data;
  },
  getMyRequests: async () => {
    const res = await api.get('/pottery-requests/my');
    return res.data;
  },
  updateRequest: async (id, updateData) => {
    const res = await api.patch(`/pottery-requests/${id}`, updateData);
    return res.data;
  },
  cancelRequest: async (id) => {
    const res = await api.patch(`/pottery-requests/${id}/cancel`);
    return res.data;
  },
  getAllRequestsAdmin: async () => {
    const res = await api.get('/admin/pottery-requests');
    return res.data;
  },
  acceptRequestAdmin: async (id) => {
    const res = await api.patch(`/admin/pottery-requests/${id}/accept`);
    return res.data;
  },
  declineRequestAdmin: async (id) => {
    const res = await api.patch(`/admin/pottery-requests/${id}/decline`);
    return res.data;
  }
};
