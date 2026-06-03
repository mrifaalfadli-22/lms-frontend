// src/hooks/useJadwalKuliah.js
import { useState, useEffect, useCallback } from "react";
import jadwalService from "../services/jadwalService";

export function useJadwalKuliah() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJadwal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jadwalService.getAll();
      setJadwal(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat data jadwal. Periksa koneksi atau coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  /** Tambah jadwal — lempar error agar modal bisa tangkap pesan validasi BE. */
  const tambah = useCallback(
    async (values) => {
      const res = await jadwalService.create(values);
      await fetchJadwal();
      return res;
    },
    [fetchJadwal],
  );

  /** Update jadwal. */
  const update = useCallback(
    async (id, values) => {
      const res = await jadwalService.update(id, values);
      await fetchJadwal();
      return res;
    },
    [fetchJadwal],
  );

  /**
   * Hapus jadwal.
   * Optimistic update lokal dulu, lalu re-fetch untuk sinkronisasi.
   */
  const hapus = useCallback(
    async (id) => {
      setJadwal((prev) => prev.filter((j) => j.id_jadwal !== id));
      try {
        await jadwalService.delete(id);
      } catch (err) {
        // Rollback: fetch ulang kalau delete gagal di server
        await fetchJadwal();
        throw err;
      }
    },
    [fetchJadwal],
  );

  return {
    jadwal,
    loading,
    error,
    tambah,
    update,
    hapus,
    refresh: fetchJadwal,
  };
}
