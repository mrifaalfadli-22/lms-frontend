// src/services/materiService.js
import api from "../config/api";

const BASE = "/materi";

/**
 * Memetakan satu item materi dari response API ke shape yang dipakai FE.
 */
const mapMateri = (item) => ({
  id: item.id ?? item.id_materi,
  id_sesi: item.id_sesi,
  judul_materi: item.judul_materi ?? item.judul ?? "-",
  deskripsi: item.deskripsi ?? "",
  tipe_materi: item.tipe_materi ?? item.tipe ?? "-",
  url_file: item.url_file ?? item.file_url ?? null,
  nama_file: item.nama_file ?? null,
  ukuran_file: item.ukuran_file ?? null,
  urutan: item.urutan ?? null,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const materiService = {
  /**
   * Ambil daftar materi berdasarkan ID sesi pertemuan.
   * @param {string} id_sesi
   */
  getBySesi: async (id_sesi) => {
    const res = await api.get(`${BASE}/sesi/${id_sesi}`);
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapMateri) : [];
  },

  /**
   * Upload materi baru (Dosen). Menggunakan multipart/form-data.
   * @param {FormData} formData - Berisi: id_sesi, judul_materi, deskripsi?, tipe_materi, file/url
   */
  upload: async (formData) => {
    const res = await api.post(`${BASE}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /**
   * Update materi (Dosen).
   * @param {string} id
   * @param {Object|FormData} payload
   */
  update: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.put(`${BASE}/${id}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return res.data;
  },

  /**
   * Hapus materi (Dosen).
   * @param {string} id
   */
  delete: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },

  /**
   * Generate link download materi (signed URL atau redirect).
   * @param {string} id
   */
  getDownloadLink: async (id) => {
    const res = await api.get(`${BASE}/${id}/download`);
    return res.data;
  },
};

export default materiService;
