import api from './axios.js';

export const wallBookingApi = {
  getWallRate: async () => {
    const res = await api.get('/wall-bookings/rate');
    return res.data;
  },
  getBookedDates: async () => {
    const res = await api.get('/wall-bookings/availability');
    return res.data;
  },
  createBooking: async (bookingData) => {
    const res = await api.post('/wall-bookings', bookingData);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await api.get('/wall-bookings/my');
    return res.data;
  },
  cancelBooking: async (id) => {
    const res = await api.patch(`/wall-bookings/${id}/cancel`);
    return res.data;
  },
  getAllBookingsAdmin: async () => {
    const res = await api.get('/admin/wall-bookings');
    return res.data;
  },
  confirmBookingAdmin: async (id) => {
    const res = await api.patch(`/admin/wall-bookings/${id}/confirm`);
    return res.data;
  },
  declineBookingAdmin: async (id) => {
    const res = await api.patch(`/admin/wall-bookings/${id}/decline`);
    return res.data;
  }
};
