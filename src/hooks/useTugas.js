// src/hooks/useTugas.js
import { useState, useCallback, useRef } from "react";
import tugasService from "../services/tugasService";

const DEBOUNCE_MS = 400;

export function useTugas() {
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const lastSesiIdRef = useRef(null);
  const debounceRef = useRef(null);

  /**
   * Ambil semua tugas (Admin).
   * @param {Object} params - { page, per_page, search }
   */
  const fetchAllAdmin = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tugasService.getAllAdmin(params);
      setTugasList(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat data tugas. Periksa koneksi atau coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ambil tugas untuk satu sesi tertentu (Dosen).
   * @param {string} sesi_id
   */
  const fetchBySesi = useCallback(async (sesi_id) => {
    setLoading(true);
    setError(null);
    lastSesiIdRef.current = sesi_id;
    try {
      const items = await tugasService.getBySesi(sesi_id);
      setTugasList(items);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat tugas untuk sesi ini.";
      setError(msg);
      setTugasList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (lastSesiIdRef.current) {
      fetchBySesi(lastSesiIdRef.current);
    }
  }, [fetchBySesi]);

  const debouncedFetchAdmin = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchAllAdmin(params), DEBOUNCE_MS);
    },
    [fetchAllAdmin]
  );

  /**
   * Cek status deadline tugas.
   * @param {string} id
   */
  const cekDeadline = useCallback(async (id) => {
    try {
      return await tugasService.cekDeadline(id);
    } catch (err) {
      console.error("Gagal cek deadline:", err);
      return null;
    }
  }, []);

  /**
   * Dapatkan launch URL CBT untuk peserta tertentu.
   * @param {string} id - id_tugas
   * @param {string} id_peserta
   */
  const getLaunchUrl = useCallback(async (id, id_peserta) => {
    return await tugasService.getLaunchUrl(id, id_peserta);
  }, []);

  /**
   * Buat tugas baru di satu sesi (Dosen).
   * @param {string} sesi_id
   * @param {Object} values
   */
  const tambah = useCallback(
    async (sesi_id, values) => {
      const res = await tugasService.create(sesi_id, values);
      refetch();
      return res;
    },
    [refetch]
  );

  /**
   * Update tugas (Dosen).
   * @param {string} id
   * @param {Object} values
   */
  const update = useCallback(
    async (id, values) => {
      const res = await tugasService.update(id, values);
      refetch();
      return res;
    },
    [refetch]
  );

  /**
   * Hapus tugas (Dosen).
   * @param {string} id
   */
  const hapus = useCallback(
    async (id) => {
      await tugasService.delete(id);
      refetch();
    },
    [refetch]
  );

  return {
    tugasList,
    loading,
    error,
    pagination,
    fetchAllAdmin,
    fetchBySesi,
    debouncedFetchAdmin,
    cekDeadline,
    getLaunchUrl,
    tambah,
    update,
    hapus,
    refresh: refetch,
  };
}
