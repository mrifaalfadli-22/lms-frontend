// src/hooks/useEvaluasi.js
import { useState, useCallback, useRef } from "react";
import evaluasiService from "../services/evaluasiService";

const DEBOUNCE_MS = 400;

export function useEvaluasi() {
  // --- Pertanyaan ---
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [loadingPertanyaan, setLoadingPertanyaan] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  // --- Rekap & Statistik ---
  const [rekap, setRekap] = useState(null);
  const [statistikKategori, setStatistikKategori] = useState(null);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const [error, setError] = useState(null);

  const lastParamsRef = useRef({});
  const debounceRef = useRef(null);

  // ============================================================
  // PERTANYAAN EVALUASI (Admin)
  // ============================================================

  /**
   * Ambil semua pertanyaan evaluasi.
   * @param {Object} params - { page, per_page, search }
   */
  const fetchPertanyaans = useCallback(async (params = {}) => {
    setLoadingPertanyaan(true);
    setError(null);
    lastParamsRef.current = params;
    try {
      const result = await evaluasiService.getPertanyaans(params);
      setPertanyaanList(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat pertanyaan evaluasi. Periksa koneksi atau coba lagi.";
      setError(msg);
    } finally {
      setLoadingPertanyaan(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchPertanyaans(lastParamsRef.current);
  }, [fetchPertanyaans]);

  const debouncedFetch = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => fetchPertanyaans(params),
        DEBOUNCE_MS
      );
    },
    [fetchPertanyaans]
  );

  /** Buat pertanyaan baru (Admin). */
  const tambah = useCallback(
    async (values) => {
      const res = await evaluasiService.createPertanyaan(values);
      refetch();
      return res;
    },
    [refetch]
  );

  /** Update pertanyaan (Admin). */
  const update = useCallback(
    async (id_pertanyaan, values) => {
      const res = await evaluasiService.updatePertanyaan(id_pertanyaan, values);
      refetch();
      return res;
    },
    [refetch]
  );

  /** Hapus pertanyaan (Admin). */
  const hapus = useCallback(
    async (id_pertanyaan) => {
      await evaluasiService.deletePertanyaan(id_pertanyaan);
      refetch();
    },
    [refetch]
  );

  /** Toggle aktif/nonaktif pertanyaan (Admin). */
  const toggleAktif = useCallback(
    async (id_pertanyaan) => {
      const res = await evaluasiService.toggleAktifPertanyaan(id_pertanyaan);
      refetch();
      return res;
    },
    [refetch]
  );

  /**
   * Update urutan banyak pertanyaan sekaligus (drag-and-drop).
   * @param {Array} urutan - [{ id_pertanyaan, urutan }]
   */
  const bulkUpdateUrutan = useCallback(
    async (urutan) => {
      const res = await evaluasiService.bulkUpdateUrutan(urutan);
      refetch();
      return res;
    },
    [refetch]
  );

  // ============================================================
  // REKAP & STATISTIK (Admin & Dosen read)
  // ============================================================

  /** Ambil rekap lengkap jawaban evaluasi (Admin). */
  const fetchRekap = useCallback(async (params = {}) => {
    setLoadingRekap(true);
    setError(null);
    try {
      const data = await evaluasiService.getRekap(params);
      setRekap(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Gagal memuat rekap evaluasi.";
      setError(msg);
    } finally {
      setLoadingRekap(false);
    }
  }, []);

  /** Ambil statistik jawaban per kategori (Admin). */
  const fetchStatistikKategori = useCallback(async () => {
    try {
      const data = await evaluasiService.getStatistikKategori();
      setStatistikKategori(data);
    } catch (err) {
      console.error("Gagal memuat statistik kategori evaluasi:", err);
    }
  }, []);

  /**
   * Cek apakah peserta sudah mengisi evaluasi.
   * @param {string} id_peserta
   */
  const cekStatusPeserta = useCallback(async (id_peserta) => {
    try {
      return await evaluasiService.cekStatusPeserta(id_peserta);
    } catch (err) {
      console.error("Gagal cek status evaluasi peserta:", err);
      return null;
    }
  }, []);

  return {
    // Pertanyaan
    pertanyaanList,
    loadingPertanyaan,
    pagination,
    error,
    fetchPertanyaans,
    debouncedFetch,
    tambah,
    update,
    hapus,
    toggleAktif,
    bulkUpdateUrutan,
    refresh: refetch,
    // Rekap & Statistik
    rekap,
    statistikKategori,
    loadingRekap,
    fetchRekap,
    fetchStatistikKategori,
    cekStatusPeserta,
    // Service methods langsung (tanpa state)
    getStatistikPertanyaan: evaluasiService.getStatistikPertanyaan,
    getJawabanByPeserta: evaluasiService.getJawabanByPeserta,
  };
}
