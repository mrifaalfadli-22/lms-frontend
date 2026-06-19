import { useState, useCallback, useRef } from "react";
import { penggunaService } from "../services/penggunaService";

const DEBOUNCE_MS = 400;

export const usePengguna = (activeTab) => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [dosen, setDosen] = useState([]);
  const [loadingMhs, setLoadingMhs] = useState(false);
  const [loadingDosen, setLoadingDosen] = useState(false);
  const loading = loadingMhs || loadingDosen;
  const [error, setError] = useState(null);

  const [paginationMhs, setPaginationMhs] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const [paginationDosen, setPaginationDosen] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const lastMhsParamsRef = useRef({});
  const lastDosenParamsRef = useRef({});
  const debounceRef = useRef(null);

  const fetchMahasiswa = useCallback(async (params = {}) => {
    setLoadingMhs(true);
    setError(null);
    lastMhsParamsRef.current = params;
    try {
      const result = await penggunaService.getMahasiswa(params);
      setMahasiswa(result.data);
      setPaginationMhs({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch {
      setError("Gagal memuat data mahasiswa.");
    } finally {
      setLoadingMhs(false);
    }
  }, []);

  const fetchDosen = useCallback(async (params = {}) => {
    setLoadingDosen(true);
    setError(null);
    lastDosenParamsRef.current = params;
    try {
      const result = await penggunaService.getDosen(params);
      setDosen(result.data);
      setPaginationDosen({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch {
      setError("Gagal memuat data dosen.");
    } finally {
      setLoadingDosen(false);
    }
  }, []);

  const refetchMahasiswa = useCallback(() => {
    fetchMahasiswa(lastMhsParamsRef.current);
  }, [fetchMahasiswa]);

  const refetchDosen = useCallback(() => {
    fetchDosen(lastDosenParamsRef.current);
  }, [fetchDosen]);

  const debouncedFetchMahasiswa = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => fetchMahasiswa(params),
        DEBOUNCE_MS,
      );
    },
    [fetchMahasiswa],
  );

  const debouncedFetchDosen = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchDosen(params), DEBOUNCE_MS);
    },
    [fetchDosen],
  );

  const tambahMahasiswa = useCallback(
    async (values) => {
      await penggunaService.tambahMahasiswa(values);
      refetchMahasiswa();
    },
    [refetchMahasiswa],
  );

  const updateMahasiswa = useCallback(
    async (id, values) => {
      await penggunaService.updateMahasiswa(id, values);
      refetchMahasiswa();
    },
    [refetchMahasiswa],
  );

  const updateDosen = useCallback(
    async (id, values) => {
      await penggunaService.updateDosen(id, values);
      refetchDosen();
    },
    [refetchDosen],
  );

  const deleteDosen = useCallback(
    async (id) => {
      await penggunaService.deleteDosen(id);
      refetchDosen();
    },
    [refetchDosen],
  );

  return {
    mahasiswa,
    setMahasiswa,
    dosen,
    setDosen,
    loading,
    loadingMhs,
    loadingDosen,
    error,
    paginationMhs,
    paginationDosen,
    fetchMahasiswa,
    fetchDosen,
    debouncedFetchMahasiswa,
    debouncedFetchDosen,
    tambahMahasiswa,
    updateMahasiswa,
    updateDosen,
    deleteDosen,
  };
};
