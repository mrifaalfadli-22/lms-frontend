import api from "../config/api";

export const verifikasiService = {
  getDaftarDosen: async (status = "") => {
    const params = status ? { status } : {};
    const response = await api.get("/verifikasi-dosen", { params });
    return response.data.data || [];
  },

  prosesVerifikasi: async (id, status_persetujuan) => {
    const response = await api.put(`/verifikasi-dosen/${id}`, {
      status_persetujuan,
    });
    return response.data;
  },
};
