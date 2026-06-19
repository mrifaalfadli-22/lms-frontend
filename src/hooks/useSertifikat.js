// src/hooks/useSertifikat.js
import { useState, useCallback, useRef } from "react";
import sertifikatService from "../services/sertifikatService";

const DEBOUNCE_MS = 400;

export function useSertifikat() {
  // --- Template ---
  const [templates, setTemplates] = useState([]);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // --- Sertifikat ---
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loadingSertifikat, setLoadingSertifikat] = useState(false);
  const [statistik, setStatistik] = useState(null);

  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });

  const lastSertifikatParamsRef = useRef({});
  const lastTemplateParamsRef = useRef({});
  const debounceRef = useRef(null);

  // ============================================================
  // TEMPLATE SERTIFIKAT (Admin)
  // ============================================================

  /** Ambil daftar semua template sertifikat. */
  const fetchTemplates = useCallback(async (params = {}) => {
    setLoadingTemplate(true);
    setError(null);
    lastTemplateParamsRef.current = params;
    try {
      const result = await sertifikatService.getTemplates(params);
      setTemplates(result.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal memuat template sertifikat.";
      setError(msg);
    } finally {
      setLoadingTemplate(false);
    }
  }, []);

  const refetchTemplates = useCallback(() => {
    fetchTemplates(lastTemplateParamsRef.current);
  }, [fetchTemplates]);

  /** Buat template baru (multipart). */
  const tambahTemplate = useCallback(
    async (formData) => {
      const res = await sertifikatService.createTemplate(formData);
      refetchTemplates();
      return res;
    },
    [refetchTemplates]
  );

  /** Update data template. */
  const updateTemplate = useCallback(
    async (id_template, payload) => {
      const res = await sertifikatService.updateTemplate(id_template, payload);
      refetchTemplates();
      return res;
    },
    [refetchTemplates]
  );

  /** Hapus template. */
  const hapusTemplate = useCallback(
    async (id_template) => {
      await sertifikatService.deleteTemplate(id_template);
      refetchTemplates();
    },
    [refetchTemplates]
  );

  /** Toggle aktif/nonaktif template. */
  const toggleAktifTemplate = useCallback(
    async (id_template) => {
      const res = await sertifikatService.toggleAktifTemplate(id_template);
      refetchTemplates();
      return res;
    },
    [refetchTemplates]
  );

  /** Upload background template. */
  const uploadBackground = useCallback(
    async (id_template, formData) => {
      const res = await sertifikatService.uploadBackground(id_template, formData);
      refetchTemplates();
      return res;
    },
    [refetchTemplates]
  );

  // ============================================================
  // SERTIFIKAT (Admin)
  // ============================================================

  /**
   * Ambil daftar sertifikat dengan filter dan pagination.
   * @param {Object} params - { id_peserta?, id_template?, dari_tanggal?, sampai_tanggal?, per_page? }
   */
  const fetchSertifikats = useCallback(async (params = {}) => {
    setLoadingSertifikat(true);
    setError(null);
    lastSertifikatParamsRef.current = params;
    try {
      const result = await sertifikatService.getSertifikats(params);
      setSertifikatList(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal memuat data sertifikat.";
      setError(msg);
    } finally {
      setLoadingSertifikat(false);
    }
  }, []);

  const refetchSertifikats = useCallback(() => {
    fetchSertifikats(lastSertifikatParamsRef.current);
  }, [fetchSertifikats]);

  const debouncedFetch = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => fetchSertifikats(params),
        DEBOUNCE_MS
      );
    },
    [fetchSertifikats]
  );

  /** Ambil statistik sertifikat (Admin). */
  const fetchStatistik = useCallback(async () => {
    try {
      const data = await sertifikatService.getStatistik();
      setStatistik(data);
    } catch (err) {
      console.error("Gagal memuat statistik sertifikat:", err);
    }
  }, []);

  /** Terbitkan sertifikat untuk satu peserta (Admin). */
  const terbitkan = useCallback(
    async (payload) => {
      const res = await sertifikatService.create(payload);
      refetchSertifikats();
      return res;
    },
    [refetchSertifikats]
  );

  /** Terbitkan sertifikat untuk banyak peserta sekaligus (Admin). */
  const terbitkanBulk = useCallback(
    async (payload) => {
      const res = await sertifikatService.createBulk(payload);
      refetchSertifikats();
      return res;
    },
    [refetchSertifikats]
  );

  /** Update tanggal terbit sertifikat. */
  const update = useCallback(
    async (id_sertifikat, payload) => {
      const res = await sertifikatService.update(id_sertifikat, payload);
      refetchSertifikats();
      return res;
    },
    [refetchSertifikats]
  );

  /** Hapus sertifikat. */
  const hapus = useCallback(
    async (id_sertifikat) => {
      await sertifikatService.delete(id_sertifikat);
      refetchSertifikats();
    },
    [refetchSertifikats]
  );

  /** Upload file PDF sertifikat. */
  const uploadFile = useCallback(
    async (id_sertifikat, formData) => {
      const res = await sertifikatService.uploadFile(id_sertifikat, formData);
      refetchSertifikats();
      return res;
    },
    [refetchSertifikats]
  );

  /** Verifikasi nomor sertifikat. */
  const verify = useCallback(async (nomor_sertifikat) => {
    return await sertifikatService.verify(nomor_sertifikat);
  }, []);

  return {
    // Template
    templates,
    loadingTemplate,
    fetchTemplates,
    tambahTemplate,
    updateTemplate,
    hapusTemplate,
    toggleAktifTemplate,
    uploadBackground,
    downloadBackground: sertifikatService.downloadBackground,
    // Sertifikat
    sertifikatList,
    loadingSertifikat,
    statistik,
    pagination,
    error,
    fetchSertifikats,
    debouncedFetch,
    fetchStatistik,
    terbitkan,
    terbitkanBulk,
    update,
    hapus,
    uploadFile,
    verify,
    download: sertifikatService.download,
    refreshSertifikats: refetchSertifikats,
    refreshTemplates: refetchTemplates,
  };
}
