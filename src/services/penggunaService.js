import api from "../config/api";

export const penggunaService = {
  /**
   * Ambil data mahasiswa dengan server-side pagination, search, dan filter.
   * @param {Object} params - { page, search, status_aktif, angkatan, per_page }
   */
  getMahasiswa: async (params = {}) => {
    const response = await api.get("/mahasiswa", { params });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 20,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
    };
  },

  /**
   * Ambil data dosen dengan server-side pagination, search, dan filter.
   * @param {Object} params - { page, search, status, per_page }
   */
  getDosen: async (params = {}) => {
    const response = await api.get("/verifikasi-dosen", {
      params: { status: "Disetujui", ...params },
    });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 20,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
    };
  },

  tambahMahasiswa: async (data) => {
    const response = await api.post("/mahasiswa", data);
    return response.data;
  },

  updateMahasiswa: async (id, data) => {
    const response = await api.put(`/mahasiswa/${id}`, data);
    return response.data;
  },

  deleteMahasiswa: async (id) => {
    const response = await api.delete(`/mahasiswa/${id}`);
    return response.data;
  },

  updateDosen: async (id, data) => {
    const response = await api.put(`/dosen/${id}`, data);
    return response.data;
  },

  deleteDosen: async (id) => {
    const response = await api.delete(`/dosen/${id}`);
    return response.data;
  },
};
