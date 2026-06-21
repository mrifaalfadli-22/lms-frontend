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
  deskripsi: item.deskripsi || "",
  file_materi: Array.isArray(item.file_materi) 
    ? item.file_materi 
    : (() => {
        if (typeof item.file_materi === 'string') {
          try {
            const parsed = JSON.parse(item.file_materi);
            return Array.isArray(parsed) ? parsed : [item.file_materi];
          } catch (e) {
            return [item.file_materi];
          }
        }
        return [];
      })(),
  link_video_pembelajaran: item.link_video_pembelajaran || null,
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
   * Ambil semua materi berdasarkan ID jadwal (semua sesi dalam jadwal).
   * @param {string} id_jadwal
   */
  getByJadwal: async (id_jadwal) => {
    const res = await api.get(`${BASE}/jadwal/${id_jadwal}`);
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items : [];
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
    if (isFormData) {
      payload.append('_method', 'PUT');
      const res = await api.post(`${BASE}/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } else {
      const res = await api.put(`${BASE}/${id}`, payload);
      return res.data;
    }
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
  /**
   * Force download file materi
   */
  forceDownload: async (path, filename) => {
    const res = await api.get(`${BASE}/download?path=${encodeURIComponent(path)}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },
};

export default materiService;
