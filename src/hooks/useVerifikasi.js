import { useState, useEffect, useCallback } from "react";
import { verifikasiService } from "../services/verifikasiService";

export const useVerifikasi = () => {
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDosen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil semua data tanpa filter — tampilkan semua status
      const data = await verifikasiService.getDaftarDosen();
      setDosen(data);
    } catch {
      setError("Gagal memuat data pengajuan dosen.");
    } finally {
      setLoading(false);
    }
  }, []);

  const prosesVerifikasi = useCallback(async (id, status_persetujuan) => {
    await verifikasiService.prosesVerifikasi(id, status_persetujuan);
    // Update state lokal langsung tanpa fetch ulang
    setDosen((prev) =>
      prev.map((d) => (d.id_user === id ? { ...d, status_persetujuan } : d)),
    );
  }, []);

  useEffect(() => {
    fetchDosen();
  }, [fetchDosen]);

  return { dosen, loading, error, prosesVerifikasi };
};
