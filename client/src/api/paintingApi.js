import api from './axios.js';

export const paintingApi = {
  getPaintings: async (params = {}) => {
    // If params is a string (legacy compatibility: getPaintings('available'))
    const query = typeof params === 'string' ? { status: params } : params;
    const searchParams = new URLSearchParams();
    if (query.status) searchParams.append('status', query.status);
    if (query.category) searchParams.append('category', query.category);
    if (query.includeArchived) searchParams.append('includeArchived', query.includeArchived);

    const qs = searchParams.toString();
    const url = qs ? `/paintings?${qs}` : '/paintings';
    const res = await api.get(url);
    return res.data;
  },

  getPaintingById: async (id) => {
    const res = await api.get(`/paintings/${id}`);
    return res.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/paintings/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  createPainting: async (paintingData) => {
    const isFormData = typeof FormData !== 'undefined' && paintingData instanceof FormData;
    const res = await api.post('/paintings', paintingData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  updatePainting: async (id, updateData) => {
    const isFormData = typeof FormData !== 'undefined' && updateData instanceof FormData;
    const res = await api.patch(`/paintings/${id}`, updateData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return res.data;
  },

  deletePainting: async (id) => {
    const res = await api.delete(`/paintings/${id}`);
    return res.data;
  },

  restorePainting: async (id) => {
    const res = await api.patch(`/paintings/${id}/restore`);
    return res.data;
  }
};
