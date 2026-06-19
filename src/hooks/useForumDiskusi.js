// src/hooks/useForumDiskusi.js
import { useState, useCallback, useRef } from "react";
import forumDiskusiService from "../services/forumDiskusiService";

const DEBOUNCE_MS = 400;

export function useForumDiskusi() {
  const [pesanList, setPesanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const lastSesiIdRef = useRef(null);
  const debounceRef = useRef(null);

  /**
   * Ambil semua pesan forum untuk satu sesi pertemuan.
   * @param {string} id_sesi
   * @param {Object} params - { page, per_page }
   */
  const fetchBySesi = useCallback(async (id_sesi, params = {}) => {
    setLoading(true);
    setError(null);
    lastSesiIdRef.current = id_sesi;
    try {
      const result = await forumDiskusiService.getBySesi(id_sesi, params);
      setPesanList(result.data);
      setPagination({
        current_page: result.current_page,
        last_page: result.last_page,
        total: result.total,
        per_page: result.per_page,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat forum diskusi. Periksa koneksi atau coba lagi.";
      setError(msg);
      setPesanList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (lastSesiIdRef.current) {
      fetchBySesi(lastSesiIdRef.current);
    }
  }, [fetchBySesi]);

  /**
   * Cari pesan di forum sesi tertentu.
   * @param {string} id_sesi
   * @param {string} keyword
   */
  const search = useCallback(
    (id_sesi, keyword) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const items = await forumDiskusiService.search(id_sesi, keyword);
          setPesanList(items);
        } catch (err) {
          const msg =
            err?.response?.data?.message || "Gagal melakukan pencarian forum.";
          setError(msg);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  /**
   * Ambil balasan untuk satu pesan tertentu.
   * @param {string} id_pesan
   */
  const getReplies = useCallback(async (id_pesan) => {
    try {
      return await forumDiskusiService.getReplies(id_pesan);
    } catch (err) {
      console.error("Gagal memuat balasan forum:", err);
      return [];
    }
  }, []);

  /**
   * Buat post baru atau balasan (Dosen).
   * @param {Object} payload - { id_sesi, isi_pesan, id_parent_pesan? }
   */
  const kirim = useCallback(
    async (payload) => {
      const res = await forumDiskusiService.create(payload);
      refetch();
      return res;
    },
    [refetch]
  );

  /**
   * Edit isi pesan forum (Dosen, hanya milik sendiri).
   * @param {string} id_pesan
   * @param {string} isi_pesan
   */
  const edit = useCallback(
    async (id_pesan, isi_pesan) => {
      const res = await forumDiskusiService.update(id_pesan, isi_pesan);
      refetch();
      return res;
    },
    [refetch]
  );

  /**
   * Hapus pesan forum (Dosen).
   * @param {string} id_pesan
   */
  const hapus = useCallback(
    async (id_pesan) => {
      await forumDiskusiService.delete(id_pesan);
      refetch();
    },
    [refetch]
  );

  return {
    pesanList,
    loading,
    error,
    pagination,
    fetchBySesi,
    search,
    getReplies,
    kirim,
    edit,
    hapus,
    refresh: refetch,
  };
}
