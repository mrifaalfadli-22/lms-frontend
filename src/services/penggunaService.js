import api from "../config/api";

export const penggunaService = {
  getMahasiswa: async () => {
    const response = await api.get("/mahasiswa");
    return response.data.data || [];
  },

  getDosen: async () => {
    const response = await api.get("/verifikasi-dosen", {
      params: { status: "Disetujui" },
    });
    return response.data.data || [];
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

  // ✅ Baru — sudah ada di BE
  deleteDosen: async (id) => {
    const response = await api.delete(`/dosen/${id}`);
    return response.data;
  },
};
