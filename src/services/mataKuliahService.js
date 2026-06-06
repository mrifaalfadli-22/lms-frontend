import api from "../config/api";

export const mataKuliahService = {
  /**
   * Ambil data mata kuliah dengan server-side pagination, search, dan filter.
   * @param {Object} params - { page, search, semester, sks, per_page }
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
      sks: data.sks,
      deskripsi: data.deskripsi || null,
      fakultas: data.fakultas,
      prodi: data.prodi,
      semester: data.semester,
    };
    const response = await api.post("/mata-kuliah", payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = {
      kode_mk: data.kode_mk,
      nama_mk: data.nama_mk,
      sks: data.sks,
      deskripsi: data.deskripsi || null,
      fakultas: data.fakultas,
      prodi: data.prodi,
      semester: data.semester,
    };
    const response = await api.put(`/mata-kuliah/${id}`, payload);
    return response.data;
  },

  hapus: async (id) => {
    const response = await api.delete(`/mata-kuliah/${id}`);
    return response.data;
  },
};
