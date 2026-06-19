// src/services/sesiPertemuanService.js
import api from "../config/api";

const BASE = "/sesi-pertemuan";

/**
 * Memetakan satu item sesi dari response API ke shape yang dipakai FE.
 */
const mapSesi = (item) => ({
  id_sesi: item.id_sesi,
  id_jadwal: item.id_jadwal,
  pertemuan_ke: item.pertemuan_ke,
  judul_sesi: item.judul_sesi ?? "-",
  tanggal_pelaksanaan: item.tanggal_pelaksanaan ?? null,
  jam_mulai: item.jam_mulai ?? "-",
  jam_berakhir: item.jam_berakhir ?? "-",
  waktu:
    item.jam_mulai && item.jam_berakhir
      ? `${item.jam_mulai.substring(0, 5)} - ${item.jam_berakhir.substring(0, 5)}`
      : "-",
  metode_pertemuan: item.metode_pertemuan ?? "-",
  link_kelas_daring: item.link_kelas_daring ?? null,
  // Relasi jadwal (jika di-load)
  jadwal_perkuliahan: item.jadwal_perkuliahan ?? null,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const sesiPertemuanService = {
  /**
   * Ambil daftar sesi pertemuan dengan pagination dan filter.
   * @param {Object} params - { page, per_page, id_jadwal, tanggal, metode_pertemuan }
   */
  getPage: async (params = {}) => {
    const res = await api.get(BASE, { params });
    // Response BE: { status, data: { current_page, data: [...], total, per_page } }
    const payload = res.data.data ?? res.data;
    return {
      data: (payload.data || []).map(mapSesi),
      total: payload.total || 0,
      per_page: payload.per_page || 10,
      current_page: payload.current_page || 1,
      last_page: payload.last_page || 1,
    };
  },

  /**
   * Ambil semua sesi milik satu jadwal perkuliahan tertentu.
   * @param {string} id_jadwal
   */
  getByJadwal: async (id_jadwal) => {
    const res = await api.get(`${BASE}/jadwal/${id_jadwal}`);
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data || [];
    return items.map(mapSesi);
  },

  /**
   * Ambil detail satu sesi pertemuan.
   * @param {string} id_sesi
   */
  getById: async (id_sesi) => {
    const res = await api.get(`${BASE}/${id_sesi}`);
    const payload = res.data.data ?? res.data;
    return mapSesi(payload);
  },

  /**
   * Cek apakah sesi sedang aktif (dalam rentang waktu pertemuan).
   * @param {string} id_sesi
   */
  cekAktif: async (id_sesi) => {
    const res = await api.get(`${BASE}/${id_sesi}/aktif`);
    return res.data;
  },

  /**
   * Tambah sesi pertemuan baru (Dosen).
   * @param {Object} payload - { id_jadwal, pertemuan_ke, judul_sesi, tanggal_pelaksanaan, jam_mulai, jam_berakhir, metode_pertemuan, link_kelas_daring? }
   */
  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  /**
   * Update sesi pertemuan (Dosen). Field id_jadwal tidak boleh dikirim.
   * @param {string} id_sesi
   * @param {Object} payload - { pertemuan_ke, judul_sesi, tanggal_pelaksanaan, jam_mulai, jam_berakhir, metode_pertemuan, link_kelas_daring? }
   */
  update: async (id_sesi, payload) => {
    const res = await api.put(`${BASE}/${id_sesi}`, payload);
    return res.data;
  },

  /**
   * Hapus sesi pertemuan (Dosen).
   * @param {string} id_sesi
   */
  delete: async (id_sesi) => {
    const res = await api.delete(`${BASE}/${id_sesi}`);
    return res.data;
  },
};

export default sesiPertemuanService;
