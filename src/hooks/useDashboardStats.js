import { useState, useCallback, useEffect, useRef } from "react";
import { penggunaService } from "../services/penggunaService";
import { mataKuliahService } from "../services/mataKuliahService";
import { kelasService } from "../services/kelasService";
import { verifikasiService } from "../services/verifikasiService";

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
    // kalau sedang fetch jangan fetch lagi
    if (fetchingRef.current) return;

    // pakai cache
    if (cacheRef.current && !force) {
      const cached = cacheRef.current;

      setStats(cached.stats);
      setDosenList(cached.dosenList);

      return;
    }

    fetchingRef.current = true;

    setStatsLoading(true);
    setDosenLoading(true);

    setDosenError(null);
    setGlobalError(null);

    try {
      const [mahasiswaResult, kelasResult, mkResult, dosenResult] =
        await Promise.allSettled([
          penggunaService.getMahasiswa(),
          kelasService.getAll(),
          mataKuliahService.getAll(),
          verifikasiService.getDaftarDosen(),
        ]);

      const newStats = {
        mahasiswa:
          mahasiswaResult.status === "fulfilled"
            ? mahasiswaResult.value.length
            : "-",

        kelas:
          kelasResult.status === "fulfilled" ? kelasResult.value.length : "-",

        mataKuliah:
          mkResult.status === "fulfilled" ? mkResult.value.length : "-",

        dosen:
          dosenResult.status === "fulfilled"
            ? dosenResult.value.filter(
                (d) => d.status_persetujuan === "Disetujui",
              ).length
            : "-",
      };

      const newDosenList =
        dosenResult.status === "fulfilled"
          ? dosenResult.value.slice(0, 10)
          : [];

      setStats(newStats);
      setDosenList(newDosenList);

      // simpan cache
      cacheRef.current = {
        stats: newStats,
        dosenList: newDosenList,
      };

      if (dosenResult.status === "rejected") {
        setDosenError("Gagal memuat data pengajuan dosen.");
      }

      const allFailed =
        mahasiswaResult.status === "rejected" &&
        kelasResult.status === "rejected" &&
        mkResult.status === "rejected" &&
        dosenResult.status === "rejected";

      if (allFailed) {
        setGlobalError("Gagal memuat data dashboard. Coba refresh halaman.");
      }
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
