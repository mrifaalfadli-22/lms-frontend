import api from "../config/api";

const BASE = "/profile";

export const profileService = {
  /**
   * Ambil data profil user yang sedang login
   */
  getProfile: async () => {
    const res = await api.get(BASE);
    return res.data;
  },

  /**
   * Update data profil dasar (nama, email, alamat, telp, tgl lahir)
   */
  updateProfile: async (data) => {
    const res = await api.put(BASE, data);
    return res.data;
  },

  /**
   * Upload foto profil baru (menggunakan FormData)
   */
  uploadFoto: async (file) => {
    const formData = new FormData();
    formData.append("foto", file);

    const res = await api.post(`${BASE}/foto`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Ganti kata sandi
   */
  changePassword: async (data) => {
    const res = await api.put(`${BASE}/password`, data);
    return res.data;
  },
};
