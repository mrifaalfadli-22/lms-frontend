import { useState, useCallback, useEffect, useRef } from "react";
import { dashboardService } from "../services/dashboardService";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    mahasiswa: "-",
    dosen: "-",
    kelas: "-",
    mataKuliah: "-",
  });

  const [statsLoading, setStatsLoading] = useState(false);
  const [dosenLoading, setDosenLoading] = useState(false);
  const [dosenError, setDosenError] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [dosenList, setDosenList] = useState([]);

  // cegah fetch bersamaan
  const fetchingRef = useRef(false);

  // cegah double fetch StrictMode
  const hasFetched = useRef(false);

  // cache sementara
  const cacheRef = useRef(null);

  const fetchDashboard = useCallback(async (force = false) => {
    if (fetchingRef.current) return;

    // pakai cache
    if (cacheRef.current && !force) {
      setStats(cacheRef.current.stats);
      setDosenList(cacheRef.current.dosenList);
      return;
    }

    fetchingRef.current = true;
    setStatsLoading(true);
    setDosenLoading(true);
    setDosenError(null);
    setGlobalError(null);

    try {
      // Satu request saja — sangat ringan!
      const result = await dashboardService.getStats();

      const newStats = {
        mahasiswa: result.stats?.mahasiswa ?? "-",
        dosen: result.stats?.dosen ?? "-",
        kelas: result.stats?.kelas ?? "-",
        mataKuliah: result.stats?.mata_kuliah ?? "-",
      };

      const newDosenList = result.dosen_terbaru || [];

      setStats(newStats);
      setDosenList(newDosenList);

      // simpan cache
      cacheRef.current = {
        stats: newStats,
        dosenList: newDosenList,
      };
    } catch (err) {
      console.error(err);
      setGlobalError("Terjadi kesalahan saat memuat dashboard.");
    } finally {
      setStatsLoading(false);
      setDosenLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    setStats,

    dosenList,
    setDosenList,

    statsLoading,
    dosenLoading,

    dosenError,
    globalError,

    // refresh manual
    fetchDashboard: () => fetchDashboard(true),
  };
};
