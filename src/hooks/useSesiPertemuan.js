// src/hooks/useSesiPertemuan.js
import { useState, useCallback, useRef } from "react";
import sesiPertemuanService from "../services/sesiPertemuanService";

const DEBOUNCE_MS = 400;

export function useSesiPertemuan() {
  const [sesiList, setSesiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const lastParamsRef = useRef({});
  const debounceRef = useRef(null);

  /**
   * Ambil daftar sesi dengan pagination dan filter.
   * @param {Object} params - { page, per_page, id_jadwal, tanggal, metode_pertemuan }
   */
  const fetchPage = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;
    try {
      const result = await sesiPertemuanService.getPage(params);
      setSesiList(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat data sesi pertemuan. Periksa koneksi atau coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ambil semua sesi milik satu jadwal perkuliahan.
   * @param {string} id_jadwal
   */
  const fetchByJadwal = useCallback(async (id_jadwal) => {
    setLoading(true);
    setError(null);
    try {
      const items = await sesiPertemuanService.getByJadwal(id_jadwal);
      setSesiList(items);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat sesi pertemuan untuk jadwal ini.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchPage(lastParamsRef.current);
  }, [fetchPage]);

  const debouncedFetch = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchPage(params), DEBOUNCE_MS);
    },
    [fetchPage]
  );

  /** Cek status aktif sebuah sesi (dalam rentang waktu pertemuan). */
  const cekAktif = useCallback(async (id_sesi) => {
    try {
      return await sesiPertemuanService.cekAktif(id_sesi);
    } catch (err) {
      console.error("Gagal cek sesi aktif:", err);
      return null;
    }
  }, []);

  /** Tambah sesi pertemuan baru (Dosen). */
  const tambah = useCallback(
    async (values) => {
      const res = await sesiPertemuanService.create(values);
      refetch();
      return res;
    },
    [refetch]
  );

  /** Update sesi pertemuan (Dosen). */
  const update = useCallback(
    async (id_sesi, values) => {
      const res = await sesiPertemuanService.update(id_sesi, values);
      refetch();
      return res;
    },
    [refetch]
  );

  /** Hapus sesi pertemuan (Dosen). */
  const hapus = useCallback(
    async (id_sesi) => {
      await sesiPertemuanService.delete(id_sesi);
      refetch();
    },
    [refetch]
  );

  return {
    sesiList,
    loading,
    error,
    pagination,
    fetchPage,
    fetchByJadwal,
    debouncedFetch,
    cekAktif,
    tambah,
    update,
    hapus,
    refresh: refetch,
  };
}
