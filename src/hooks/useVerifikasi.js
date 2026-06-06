import { useState, useCallback, useRef } from "react";
import { verifikasiService } from "../services/verifikasiService";

const DEBOUNCE_MS = 400;

export const useVerifikasi = () => {
  const [dosen, setDosen] = useState([]);
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

  const fetchDosen = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    lastParamsRef.current = params;
    try {
      const result = await verifikasiService.getDaftarDosen(params);
      setDosen(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch {
      setError("Gagal memuat data pengajuan dosen.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchDosen(lastParamsRef.current);
  }, [fetchDosen]);

  const debouncedFetch = useCallback(
    (params) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchDosen(params), DEBOUNCE_MS);
    },
    [fetchDosen],
  );

  const prosesVerifikasi = useCallback(
    async (id, status_persetujuan) => {
      await verifikasiService.prosesVerifikasi(id, status_persetujuan);
      // Update state lokal langsung tanpa fetch ulang
      setDosen((prev) =>
        prev.map((d) =>
          d.id_user === id ? { ...d, status_persetujuan } : d,
        ),
      );
    },
    [],
  );

  return {
    dosen,
    loading,
    error,
    pagination,
    fetchDosen,
    debouncedFetch,
    prosesVerifikasi,
  };
};
