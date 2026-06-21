// src/services/forumDiskusiService.js
import api from "../config/api";

/**
 * Memetakan satu item pesan forum dari response API ke shape yang dipakai FE.
 */
const mapPesan = (item) => ({
  id_pesan: item.id_pesan ?? item.id,
  id_sesi: item.id_sesi,
  id_pengirim: item.id_pengirim ?? item.id_user,
  id_parent_pesan: item.id_parent_pesan ?? null,
  isi_pesan: item.isi_pesan ?? "",
  // Relasi pengirim
  nama_pengirim: item.pengirim?.nama_lengkap ?? item.user?.nama_lengkap ?? "-",
  role_pengirim: item.pengirim?.role ?? item.user?.role ?? "-",
  // Sesi
  pertemuan: item.sesi?.pertemuan_ke ? `Pertemuan ke-${item.sesi.pertemuan_ke}` : "-",
  pertemuan_ke: item.sesi?.pertemuan_ke ?? 0,
  // Metadata
  jumlah_balasan: item.jumlah_balasan ?? 0,
  created_at: item.created_at,
  updated_at: item.updated_at,
  // Balasan (jika di-load)
  replies: (item.replies || []).map((r) => mapPesan(r)),
});

const forumDiskusiService = {
  /**
   * Ambil semua pesan forum untuk satu sesi pertemuan.
   * @param {string} id_sesi
   * @param {Object} params - { page, per_page }
   */
  getBySesi: async (id_sesi, params = {}) => {
    const res = await api.get(`/sesi/${id_sesi}/forum`, { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return {
      data: items.map(mapPesan),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 20,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  /**
   * Ambil semua pesan forum untuk satu jadwal pertemuan (seluruh sesi).
   * @param {string} id_jadwal
   * @param {Object} params - { page, per_page }
   */
  getByJadwal: async (id_jadwal, params = {}) => {
    const res = await api.get(`/jadwal/${id_jadwal}/forum`, { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return {
      data: items.map(mapPesan),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 20,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  /**
   * Ambil detail satu pesan forum.
   * @param {string} id_pesan
   */
  getById: async (id_pesan) => {
    const res = await api.get(`/forum/${id_pesan}`);
    const payload = res.data.data ?? res.data;
    return mapPesan(payload);
  },

  /**
   * Ambil balasan dari satu pesan forum.
   * @param {string} id_pesan
   */
  getReplies: async (id_pesan) => {
    const res = await api.get(`/forum/${id_pesan}/replies`);
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapPesan) : [];
  },

  /**
   * Cari pesan forum dalam satu sesi.
   * @param {string} id_sesi
   * @param {string} keyword - kata kunci pencarian
   */
  search: async (id_sesi, keyword) => {
    const res = await api.get(`/sesi/${id_sesi}/forum/search`, {
      params: { q: keyword },
    });
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapPesan) : [];
  },

  /**
   * Buat post baru atau balasan di forum (Dosen).
   * @param {Object} payload - { id_sesi, isi_pesan, id_parent_pesan? }
   */
  create: async (payload) => {
    const res = await api.post("/forum", payload);
    return res.data;
  },

  /**
   * Edit isi pesan forum (Dosen, hanya post milik sendiri).
   * @param {string} id_pesan
   * @param {string} isi_pesan
   */
  update: async (id_pesan, isi_pesan) => {
    const res = await api.put(`/forum/${id_pesan}`, { isi_pesan });
    return res.data;
  },

  /**
   * Hapus pesan forum (Dosen).
   * @param {string} id_pesan
   */
  delete: async (id_pesan) => {
    const res = await api.delete(`/forum/${id_pesan}`);
    return res.data;
  },
};

export default forumDiskusiService;
