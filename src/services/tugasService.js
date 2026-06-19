// src/services/tugasService.js
import api from "../config/api";

/**
 * Memetakan satu item tugas dari response API ke shape yang dipakai FE.
 */
const mapTugas = (item) => ({
  id: item.id ?? item.id_tugas,
  id_sesi: item.id_sesi ?? item.sesi_id,
  judul_tugas: item.judul_tugas ?? "-",
  deskripsi_tugas: item.deskripsi_tugas ?? "",
  batas_waktu: item.batas_waktu ?? null,
  link_cbt: item.link_cbt ?? null,
  token_cbt: item.token_cbt ?? null,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const tugasService = {
  // ============================================================
  // ADMIN
  // ============================================================

  /**
   * Ambil daftar semua tugas (Admin).
   * @param {Object} params - { page, per_page, search }
   */
  getAllAdmin: async (params = {}) => {
    const res = await api.get("/admin/tugas", { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload)
      ? payload
      : payload.data ?? [];
    return {
      data: items.map(mapTugas),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 20,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  // ============================================================
  // DOSEN
  // ============================================================

  /**
   * Ambil daftar tugas di satu sesi tertentu (Dosen & Mahasiswa).
   * @param {string} sesi_id
   */
  getBySesi: async (sesi_id) => {
    const res = await api.get(`/sesi/${sesi_id}/tugas`);
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return items.map(mapTugas);
  },

  /**
   * Ambil detail satu tugas (Dosen & Mahasiswa).
   * @param {string} id
   */
  getById: async (id) => {
    const res = await api.get(`/tugas/${id}`);
    const payload = res.data.data ?? res.data;
    return mapTugas(payload);
  },

  /**
   * Cek deadline tugas — apakah masih dalam batas waktu atau sudah lewat.
   * @param {string} id
   */
  cekDeadline: async (id) => {
    const res = await api.get(`/tugas/${id}/deadline`);
    return res.data;
  },

  /**
   * Dapatkan launch URL untuk CBT (Dosen & Mahasiswa).
   * @param {string} id - id_tugas
   * @param {string} id_peserta
   */
  getLaunchUrl: async (id, id_peserta) => {
    const res = await api.get(`/tugas/${id}/launch/${id_peserta}`);
    return res.data;
  },

  /**
   * Buat tugas baru di satu sesi (Dosen).
   * @param {string} sesi_id
   * @param {Object} payload - { judul_tugas, deskripsi_tugas?, batas_waktu, link_cbt?, token_cbt? }
   */
  create: async (sesi_id, payload) => {
    const res = await api.post(`/sesi/${sesi_id}/tugas`, payload);
    return res.data;
  },

  /**
   * Update tugas (Dosen).
   * @param {string} id
   * @param {Object} payload - { judul_tugas?, deskripsi_tugas?, batas_waktu?, link_cbt?, token_cbt? }
   */
  update: async (id, payload) => {
    const res = await api.put(`/tugas/${id}`, payload);
    return res.data;
  },

  /**
   * Hapus tugas (Dosen).
   * @param {string} id
   */
  delete: async (id) => {
    const res = await api.delete(`/tugas/${id}`);
    return res.data;
  },
};

export default tugasService;
