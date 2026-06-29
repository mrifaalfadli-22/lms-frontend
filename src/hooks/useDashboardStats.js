import { useState, useCallback, useEffect, useRef } from "react";
import { dashboardService } from "../services/dashboardService";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    mahasiswa: "-",
    dosen: 0,
    kelas: 0,
    mataKuliah: 0,
    sertifikat: 0,
  });

  const [statsLoading, setStatsLoading] = useState(false);
  const [dosenLoading, setDosenLoading] = useState(false);
  const [dosenError, setDosenError] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [dosenList, setDosenList] = useState([]);
  const [forumList, setForumList] = useState([]);

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
      setForumList(cacheRef.current.forumList);
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
        dosen: result.stats?.dosen ?? 0,
        kelas: result.stats?.kelas ?? 0,
        mataKuliah: result.stats?.mata_kuliah ?? 0,
        sertifikat: result.stats?.sertifikat ?? 0,
      };

      const newDosenList = result.dosen_terbaru || [];
      const newForumList = result.forum_terbaru || [];

      setStats(newStats);
      setDosenList(newDosenList);
      setForumList(newForumList);

      // simpan cache
      cacheRef.current = {
        stats: newStats,
        dosenList: newDosenList,
        forumList: newForumList,
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

    forumList,
    setForumList,

    statsLoading,
    dosenLoading,

    dosenError,
    globalError,

    // refresh manual
    fetchDashboard: () => fetchDashboard(true),
  };
};
