// src/services/evaluasiService.js
import api from "../config/api";

// ============================================================
// MAPPERS
// ============================================================

const mapPertanyaan = (item) => ({
  id_pertanyaan: item.id_pertanyaan,
  kategori: item.kategori ?? "-",
  teks_pertanyaan: item.teks_pertanyaan ?? "-",
  urutan: item.urutan ?? 0,
  is_aktif: item.is_aktif ?? false,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

// ============================================================
// SERVICE
// ============================================================

const evaluasiService = {
  // ----------------------------------------------------------
  // Pertanyaan Evaluasi (Admin)
  // ----------------------------------------------------------

  /**
   * Ambil semua pertanyaan evaluasi (Admin).
   * @param {Object} params - { page, per_page, search }
   */
  getPertanyaans: async (params = {}) => {
    const res = await api.get("/pertanyaan-evaluasi", { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return {
      data: items.map(mapPertanyaan),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 20,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  /** Ambil pertanyaan yang berstatus aktif saja. */
  getPertanyaansAktif: async () => {
    const res = await api.get("/pertanyaan-evaluasi/aktif");
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapPertanyaan) : [];
  },

  /** Ambil daftar kategori pertanyaan yang tersedia. */
  getKategori: async () => {
    const res = await api.get("/pertanyaan-evaluasi/kategori");
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items : [];
  },

  /** Ambil detail satu pertanyaan. */
  getPertanyaanById: async (id_pertanyaan) => {
    const res = await api.get(`/pertanyaan-evaluasi/${id_pertanyaan}`);
    const payload = res.data.data ?? res.data;
    return mapPertanyaan(payload);
  },

  /**
   * Buat pertanyaan evaluasi baru (Admin).
   * @param {Object} payload - { kategori, teks_pertanyaan, urutan, is_aktif? }
   */
  createPertanyaan: async (payload) => {
    const res = await api.post("/pertanyaan-evaluasi", payload);
    return res.data;
  },

  /**
   * Update pertanyaan evaluasi (Admin).
   * @param {string} id_pertanyaan
   * @param {Object} payload - { kategori?, teks_pertanyaan?, urutan?, is_aktif? }
   */
  updatePertanyaan: async (id_pertanyaan, payload) => {
    const res = await api.put(`/pertanyaan-evaluasi/${id_pertanyaan}`, payload);
    return res.data;
  },

  /** Hapus pertanyaan (Admin). */
  deletePertanyaan: async (id_pertanyaan) => {
    const res = await api.delete(`/pertanyaan-evaluasi/${id_pertanyaan}`);
    return res.data;
  },

  /** Toggle status aktif/nonaktif pertanyaan (Admin). */
  toggleAktifPertanyaan: async (id_pertanyaan) => {
    const res = await api.put(`/pertanyaan-evaluasi/${id_pertanyaan}/toggle`);
    return res.data;
  },

  /**
   * Update urutan banyak pertanyaan sekaligus (Admin).
   * @param {Array} urutan - [{ id_pertanyaan, urutan }]
   */
  bulkUpdateUrutan: async (urutan) => {
    const res = await api.post("/pertanyaan-evaluasi/bulk-urutan", { urutan });
    return res.data;
  },

  // ----------------------------------------------------------
  // Jawaban Evaluasi — hanya READ untuk Admin & Dosen
  // (Mahasiswa yang menulis jawaban, tapi Admin/Dosen bisa melihat rekap)
  // ----------------------------------------------------------

  /**
   * Ambil statistik jawaban untuk satu pertanyaan (Admin).
   * @param {string} id_pertanyaan
   */
  getStatistikPertanyaan: async (id_pertanyaan) => {
    const res = await api.get(
      `/jawaban-evaluasi/pertanyaan/${id_pertanyaan}/statistik`
    );
    return res.data.data ?? res.data;
  },

  /**
   * Ambil statistik jawaban per kategori (Admin).
   */
  getStatistikKategori: async () => {
    const res = await api.get("/jawaban-evaluasi/statistik-kategori");
    return res.data.data ?? res.data;
  },

  /**
   * Ambil rekap lengkap jawaban evaluasi (Admin).
   * @param {Object} params - filter opsional
   */
  getRekap: async (params = {}) => {
    const res = await api.get("/jawaban-evaluasi/rekap", { params });
    return res.data.data ?? res.data;
  },

  /**
   * Cek apakah peserta tertentu sudah mengisi evaluasi.
   * @param {string} id_peserta
   */
  cekStatusPeserta: async (id_peserta) => {
    const res = await api.get(
      `/jawaban-evaluasi/peserta/${id_peserta}/status`
    );
    return res.data.data ?? res.data;
  },

  /**
   * Ambil semua jawaban dari satu peserta (Admin/Dosen).
   * @param {string} id_peserta
   */
  getJawabanByPeserta: async (id_peserta) => {
    const res = await api.get(`/jawaban-evaluasi/peserta/${id_peserta}`);
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items : [];
  },
};

export default evaluasiService;
