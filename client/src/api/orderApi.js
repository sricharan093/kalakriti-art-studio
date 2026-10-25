import api from './axios.js';

export const orderApi = {
  createOrder: async (dataOrPaintingId, maybeDeliveryAddress) => {
    let payload;
    if (typeof dataOrPaintingId === 'object' && dataOrPaintingId !== null) {
      payload = dataOrPaintingId;
    } else {
      payload = {
        paintingId: dataOrPaintingId,
        deliveryAddress: maybeDeliveryAddress
      };
    }
    const res = await api.post('/orders', payload);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get('/orders/my');
    return res.data;
  },
  cancelOrder: async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  },
  getAllOrdersAdmin: async () => {
    const res = await api.get('/admin/orders');
    return res.data;
  }
};
