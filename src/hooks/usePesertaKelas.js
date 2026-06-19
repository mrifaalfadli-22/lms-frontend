// src/hooks/usePesertaKelas.js
import { useState, useCallback } from "react";
import pesertaKelasService from "../services/pesertaKelasService";

export function usePesertaKelas() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ambil daftar peserta yang terdaftar di suatu jadwal perkuliahan.
   * Digunakan oleh Admin & Dosen untuk melihat mahasiswa di kelas mereka.
   * @param {string} id_jadwal
   */
  const fetchByJadwal = useCallback(async (id_jadwal) => {
    setLoading(true);
    setError(null);
    try {
      const items = await pesertaKelasService.getByJadwal(id_jadwal);
      setPeserta(items);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat daftar peserta kelas. Periksa koneksi atau coba lagi.";
      setError(msg);
      setPeserta([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    peserta,
    loading,
    error,
    fetchByJadwal,
  };
}
