import api from "../config/api";

export const verifikasiService = {
  /**
   * Ambil daftar dosen dengan server-side pagination, search, dan filter status.
   * @param {Object} params - { page, search, status, per_page }
   */
  getDaftarDosen: async (params = {}) => {
    const response = await api.get("/verifikasi-dosen", { params });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 20,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
    };
  },

  prosesVerifikasi: async (id, status_persetujuan) => {
    const response = await api.put(`/verifikasi-dosen/${id}`, {
      status_persetujuan,
    });
    return response.data;
  },
};
