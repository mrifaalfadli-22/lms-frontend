import { useState, useEffect, useCallback } from "react";
import { kelasService } from "../services/kelasService";

export const useKelas = () => {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kelasService.getAll();
      setKelas(data);
    } catch {
      setError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const tambah = useCallback(
    async (values) => {
      await kelasService.tambah(values);
      await fetchAll();
    },
    [fetchAll],
  );

  const update = useCallback(
    async (id, values) => {
      await kelasService.update(id, values);
      await fetchAll();
    },
    [fetchAll],
  );

  const hapus = useCallback(async (id) => {
    await kelasService.hapus(id);
    setKelas((prev) => prev.filter((k) => k.id_kelas !== id));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    kelas,
    setKelas,
    loading,
    error,
    fetchAll,
    tambah,
    update,
    hapus,
  };
};
