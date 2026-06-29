import { useState, useCallback, useEffect, useRef } from "react";
import api from "../config/api";
import { useProfile } from "./useProfile";

export const useDosenDashboard = () => {
  const { user } = useProfile();
  const [stats, setStats] = useState({
    total_mahasiswa: "-",
    mata_kuliah_aktif: "-",
    kelas_aktif: "-",
    sertifikat_perlu_verifikasi: "-",
  });
  const [sesiHariIni, setSesiHariIni] = useState([]);
  const [forumTerbaru, setForumTerbaru] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id_user) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/dashboard/dosen/${user.id_user}`);
      const data = res.data.data;

      setStats({
        total_mahasiswa: data.stats.total_mahasiswa ?? 0,
        mata_kuliah_aktif: data.stats.mata_kuliah_aktif ?? 0,
        kelas_aktif: data.stats.kelas_aktif ?? 0,
        sertifikat_perlu_verifikasi: data.stats.sertifikat_perlu_verifikasi ?? 0,
      });
      setSesiHariIni(data.sesi_hari_ini || []);
      setForumTerbaru(data.forum_terbaru || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user?.id_user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    sesiHariIni,
    forumTerbaru,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
