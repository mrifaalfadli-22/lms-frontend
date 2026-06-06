// src/hooks/useJadwalKuliah.js
import { useState, useCallback, useRef } from "react";
import jadwalService from "../services/jadwalService";

const DEBOUNCE_MS = 400;

export function useJadwalKuliah() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const lastParamsRef = useRef({});
  const debounceRef = useRef(null);

  const fetchPage = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;
    try {
      const result = await jadwalService.getPage(params);
      setJadwal(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat data jadwal. Periksa koneksi atau coba lagi.";
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
    [fetchPage],
  );

  /** Tambah jadwal — lempar error agar modal bisa tangkap pesan validasi BE. */
  const tambah = useCallback(
    async (values) => {
      const res = await jadwalService.create(values);
      refetch();
      return res;
    },
    [refetch],
  );

  /** Update jadwal. */
  const update = useCallback(
    async (id, values) => {
      const res = await jadwalService.update(id, values);
      refetch();
      return res;
    },
    [refetch],
  );

  /** Hapus jadwal. */
  const hapus = useCallback(
    async (id) => {
      await jadwalService.delete(id);
      refetch();
    },
    [refetch],
  );

  return {
    jadwal,
    loading,
    error,
    pagination,
    fetchPage,
    debouncedFetch,
    tambah,
    update,
    hapus,
    refresh: refetch,
  };
}
