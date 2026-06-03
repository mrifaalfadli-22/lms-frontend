import api from "../config/api";

export const kelasService = {
  getAll: async () => {
    const response = await api.get("/kelas");
    return response.data.data || [];
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
