// src/services/sertifikatService.js
import api from "../config/api";

// ============================================================
// MAPPERS
// ============================================================

const mapTemplate = (item) => ({
  id_template: item.id_template,
  nama_template: item.nama_template ?? "-",
  is_aktif: item.is_aktif ?? false,
  file_background: item.file_background ?? null,
  background_url: item.background_url ?? null,
  created_at: item.created_at,
  updated_at: item.updated_at,
});

const mapSertifikat = (item) => ({
  id_sertifikat: item.id_sertifikat,
  id_peserta: item.id_peserta,
  id_template: item.id_template,
  nomor_sertifikat: item.nomor_sertifikat ?? "-",
  tanggal_terbit: item.tanggal_terbit ?? null,
  file_url: item.file_url ?? null,
  // Relasi
  peserta: item.peserta ?? null,
  nama_peserta: item.peserta?.nama_lengkap ?? "-",
  nim: item.peserta?.nim ?? item.peserta?.nomor_induk ?? "-",
  template: item.template ?? null,
  nama_template: item.template?.nama_template ?? "-",
  created_at: item.created_at,
  updated_at: item.updated_at,
});

// ============================================================
// SERVICE
// ============================================================

const sertifikatService = {
  // ----------------------------------------------------------
  // Template Sertifikat (Admin)
  // ----------------------------------------------------------

  /** Ambil daftar semua template sertifikat. */
  getTemplates: async (params = {}) => {
    const res = await api.get("/template-sertifikat", { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return {
      data: items.map(mapTemplate),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 15,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  /** Ambil daftar template yang sedang aktif. */
  getTemplatesAktif: async () => {
    const res = await api.get("/template-sertifikat/aktif");
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapTemplate) : [];
  },

  /** Ambil detail satu template. */
  getTemplateById: async (id_template) => {
    const res = await api.get(`/template-sertifikat/${id_template}`);
    const payload = res.data.data ?? res.data;
    return mapTemplate(payload);
  },

  /**
   * Buat template baru (multipart/form-data).
   * @param {FormData} formData - nama_template, file_background?, is_aktif?
   */
  createTemplate: async (formData) => {
    const res = await api.post("/template-sertifikat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** Update data template (nama, is_aktif). */
  updateTemplate: async (id_template, payload) => {
    const res = await api.put(`/template-sertifikat/${id_template}`, payload);
    return res.data;
  },

  /** Hapus template secara permanen. */
  deleteTemplate: async (id_template) => {
    const res = await api.delete(`/template-sertifikat/${id_template}`);
    return res.data;
  },

  /** Toggle status aktif template (aktif ↔ nonaktif). */
  toggleAktifTemplate: async (id_template) => {
    const res = await api.put(`/template-sertifikat/${id_template}/toggle`);
    return res.data;
  },

  /**
   * Upload gambar background ke template yang sudah ada.
   * @param {string} id_template
   * @param {FormData} formData - file_background (jpeg/jpg/png, max 5MB)
   */
  uploadBackground: async (id_template, formData) => {
    const res = await api.post(
      `/template-sertifikat/${id_template}/background`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  /** Dapatkan URL download background template. */
  downloadBackground: async (id_template) => {
    const res = await api.get(
      `/template-sertifikat/${id_template}/download-background`,
      { responseType: "blob" }
    );
    return res;
  },

  // ----------------------------------------------------------
  // Sertifikat (Admin)
  // ----------------------------------------------------------

  /**
   * Ambil daftar sertifikat dengan filter dan pagination.
   * @param {Object} params - { id_peserta?, id_template?, dari_tanggal?, sampai_tanggal?, per_page? }
   */
  getSertifikats: async (params = {}) => {
    const res = await api.get("/sertifikat", { params });
    const payload = res.data.data ?? res.data;
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    return {
      data: items.map(mapSertifikat),
      total: payload.total ?? items.length,
      per_page: payload.per_page ?? 15,
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
    };
  },

  /** Ambil semua sertifikat milik satu peserta (tanpa pagination). */
  getByPeserta: async (id_peserta) => {
    const res = await api.get(`/sertifikat/peserta/${id_peserta}`);
    const items = res.data.data ?? res.data;
    return Array.isArray(items) ? items.map(mapSertifikat) : [];
  },

  /** Ambil detail satu sertifikat. */
  getSertifikatById: async (id_sertifikat) => {
    const res = await api.get(`/sertifikat/${id_sertifikat}`);
    const payload = res.data.data ?? res.data;
    return mapSertifikat(payload);
  },

  /**
   * Terbitkan sertifikat untuk satu peserta (Admin).
   * @param {FormData|Object} payload - id_peserta, id_template, tanggal_terbit?, file_sertifikat?
   */
  create: async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await api.post("/sertifikat", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return res.data;
  },

  /**
   * Terbitkan sertifikat untuk banyak peserta sekaligus (Admin).
   * @param {Object} payload - { id_template, tanggal_terbit?, peserta: [{ id_peserta }] }
   */
  createBulk: async (payload) => {
    const res = await api.post("/sertifikat/bulk", payload);
    return res.data;
  },

  /** Update tanggal terbit sertifikat. */
  update: async (id_sertifikat, payload) => {
    const res = await api.put(`/sertifikat/${id_sertifikat}`, payload);
    return res.data;
  },

  /** Hapus sertifikat. */
  delete: async (id_sertifikat) => {
    const res = await api.delete(`/sertifikat/${id_sertifikat}`);
    return res.data;
  },

  /**
   * Upload atau timpa file PDF sertifikat.
   * @param {string} id_sertifikat
   * @param {FormData} formData - file_sertifikat (PDF, max 10MB)
   */
  uploadFile: async (id_sertifikat, formData) => {
    const res = await api.post(`/sertifikat/${id_sertifikat}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** Dapatkan URL download file PDF sertifikat. */
  download: async (id_sertifikat) => {
    const res = await api.get(`/sertifikat/${id_sertifikat}/download`);
    return res.data;
  },

  /**
   * Verifikasi keaslian sertifikat berdasarkan nomor sertifikat (publik).
   * @param {string} nomor_sertifikat - contoh: "SERT/2026/06/0001"
   */
  verify: async (nomor_sertifikat) => {
    const res = await api.get(`/sertifikat/verify/${nomor_sertifikat}`);
    return res.data;
  },

  /** Ambil statistik keseluruhan penggunaan sertifikat (Admin). */
  getStatistik: async () => {
    const res = await api.get("/sertifikat/statistik");
    return res.data.data ?? res.data;
  },
};

export default sertifikatService;
