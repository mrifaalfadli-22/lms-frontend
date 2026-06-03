import { useState, useEffect, useCallback } from "react";
import { penggunaService } from "../services/penggunaService";

export const usePengguna = (activeTab) => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMahasiswa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await penggunaService.getMahasiswa();
      setMahasiswa(data);
    } catch {
      setError("Gagal memuat data mahasiswa.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDosen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await penggunaService.getDosen();
      setDosen(data);
    } catch {
      setError("Gagal memuat data dosen.");
    } finally {
      setLoading(false);
    }
  }, []);

  const tambahMahasiswa = useCallback(
    async (values) => {
      await penggunaService.tambahMahasiswa(values);
      await fetchMahasiswa();
    },
    [fetchMahasiswa],
  );

  const updateMahasiswa = useCallback(
    async (id, values) => {
      await penggunaService.updateMahasiswa(id, values);
      await fetchMahasiswa();
    },
    [fetchMahasiswa],
  );

  const updateDosen = useCallback(
    async (id, values) => {
      await penggunaService.updateDosen(id, values);
      await fetchDosen();
    },
    [fetchDosen],
  );

  // ✅ Baru — update state lokal langsung tanpa fetch ulang
  const deleteDosen = useCallback(async (id) => {
    await penggunaService.deleteDosen(id);
    setDosen((prev) => prev.filter((d) => d.id_user !== id));
  }, []);

  useEffect(() => {
    if (activeTab === "mahasiswa") fetchMahasiswa();
    else fetchDosen();
  }, [activeTab, fetchMahasiswa, fetchDosen]);

  return {
    mahasiswa,
    setMahasiswa,
    dosen,
    setDosen,
    loading,
    error,
    fetchMahasiswa,
    fetchDosen,
    tambahMahasiswa,
    updateMahasiswa,
    updateDosen,
    deleteDosen, // ✅
  };
};
