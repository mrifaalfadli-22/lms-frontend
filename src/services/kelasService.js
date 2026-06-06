import api from "../config/api";

export const kelasService = {
  /**
   * Ambil data kelas dengan server-side pagination, search, dan filter.
   * @param {Object} params - { page, search, tahun_angkatan, per_page }
   */
  getPage: async (params = {}) => {
    const response = await api.get("/kelas", { params });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 20,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
    };
  },

  getById: async (id) => {
    const response = await api.get(`/kelas/${id}`);
    return response.data;
  },

  tambah: async (data) => {
    const response = await api.post("/kelas", {
      nama_kelas: data.nama_kelas,
      kode_kelas: data.kode_kelas,
      tahun_angkatan: data.tahun_angkatan,
      fakultas: data.fakultas || null,
      prodi: data.prodi || null,
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/kelas/${id}`, {
      nama_kelas: data.nama_kelas,
      kode_kelas: data.kode_kelas,
      tahun_angkatan: data.tahun_angkatan,
      fakultas: data.fakultas || null,
      prodi: data.prodi || null,
    });
    return response.data;
  },

  hapus: async (id) => {
    const response = await api.delete(`/kelas/${id}`);
    return response.data;
  },
};
