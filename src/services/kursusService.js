import api from "../config/api";

export const kursusService = {
  /**
   * Ambil data kursus dengan server-side pagination dan search.
   * @param {Object} params - { page, search, per_page }
   */
  getPage: async (params = {}) => {
    const response = await api.get("/mata-kuliah", { params });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 20,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
    };
  },

  getById: async (id) => {
    const response = await api.get(`/mata-kuliah/${id}`);
    return response.data;
  },

  tambah: async (data) => {
    const payload = {
      kode_mk: data.kode_mk,
      nama_mk: data.nama_mk,
      deskripsi: data.deskripsi || null,
    };
    const response = await api.post("/mata-kuliah", payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = {
      kode_mk: data.kode_mk,
      nama_mk: data.nama_mk,
      deskripsi: data.deskripsi || null,
    };
    const response = await api.put(`/mata-kuliah/${id}`, payload);
    return response.data;
  },

  hapus: async (id) => {
    const response = await api.delete(`/mata-kuliah/${id}`);
    return response.data;
  },
};
