import api from "../config/api";

export const mataKuliahService = {
  getAll: async () => {
    const response = await api.get("/mata-kuliah");
    return response.data.data || [];
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
