// src/hooks/useMateri.js
import { useState, useCallback } from "react";
import materiService from "../services/materiService";

export function useMateri() {
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ambil semua materi pembelajaran untuk satu sesi pertemuan.
   * @param {string} id_sesi
   */
  const fetchBySesi = useCallback(async (id_sesi) => {
    setLoading(true);
    setError(null);
    try {
      const items = await materiService.getBySesi(id_sesi);
      setMateriList(items);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memuat materi pembelajaran. Periksa koneksi atau coba lagi.";
      setError(msg);
      setMateriList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload materi baru (Dosen).
   * @param {FormData} formData - id_sesi, judul_materi, deskripsi?, tipe_materi, file/url
   * @param {string} id_sesi - id sesi untuk refetch setelah upload
   */
  const upload = useCallback(
    async (formData, id_sesi) => {
      const res = await materiService.upload(formData);
      if (id_sesi) await fetchBySesi(id_sesi);
      return res;
    },
    [fetchBySesi]
  );

  /**
   * Update materi (Dosen).
   * @param {string} id
   * @param {Object|FormData} payload
   * @param {string} id_sesi - untuk refetch setelah update
   */
  const update = useCallback(
    async (id, payload, id_sesi) => {
      const res = await materiService.update(id, payload);
      if (id_sesi) await fetchBySesi(id_sesi);
      return res;
    },
    [fetchBySesi]
  );

  /**
   * Hapus materi (Dosen).
   * @param {string} id
   * @param {string} id_sesi - untuk refetch setelah hapus
   */
  const hapus = useCallback(
    async (id, id_sesi) => {
      await materiService.delete(id);
      if (id_sesi) await fetchBySesi(id_sesi);
    },
    [fetchBySesi]
  );

  /**
   * Dapatkan link download materi.
   * @param {string} id
   */
  const getDownloadLink = useCallback(async (id) => {
    try {
      return await materiService.getDownloadLink(id);
    } catch (err) {
      console.error("Gagal mendapatkan link download:", err);
      return null;
    }
  }, []);

  return {
    materiList,
    loading,
    error,
    fetchBySesi,
    upload,
    update,
    hapus,
    getDownloadLink,
  };
}
