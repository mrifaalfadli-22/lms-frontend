import { useState, useCallback, useRef } from "react";
import { mataKuliahService } from "../services/mataKuliahService";

const DEBOUNCE_MS = 400;

export const useMataKuliah = () => {
  const [mataKuliah, setMataKuliah] = useState([]);
  const [loading, setLoading] = useState(false);
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
      const result = await mataKuliahService.getPage(params);
      setMataKuliah(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch {
      setError("Gagal memuat data mata kuliah.");
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

  const tambah = useCallback(
    async (values) => {
      await mataKuliahService.tambah(values);
      refetch();
    },
    [refetch],
  );

  const update = useCallback(
    async (id, values) => {
      await mataKuliahService.update(id, values);
      refetch();
    },
    [refetch],
  );

  const hapus = useCallback(
    async (id) => {
      await mataKuliahService.hapus(id);
      refetch();
    },
    [refetch],
  );

  return {
    mataKuliah,
    loading,
    error,
    pagination,
    fetchPage,
    debouncedFetch,
    tambah,
    update,
    hapus,
  };
};
