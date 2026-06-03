import { useState, useEffect, useCallback } from "react";
import { mataKuliahService } from "../services/mataKuliahService";

export const useMataKuliah = () => {
  const [mataKuliah, setMataKuliah] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mataKuliahService.getAll();
      setMataKuliah(data);
    } catch {
      setError("Gagal memuat data mata kuliah.");
    } finally {
      setLoading(false);
    }
  }, []);

  const tambah = useCallback(
    async (values) => {
      await mataKuliahService.tambah(values);
      await fetchAll();
    },
    [fetchAll],
  );

  const update = useCallback(
    async (id, values) => {
      await mataKuliahService.update(id, values);
      await fetchAll();
    },
    [fetchAll],
  );

  const hapus = useCallback(async (id) => {
    await mataKuliahService.hapus(id);
    setMataKuliah((prev) => prev.filter((mk) => mk.id_mk !== id));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    mataKuliah,
    setMataKuliah,
    loading,
    error,
    fetchAll,
    tambah,
    update,
    hapus,
  };
};
