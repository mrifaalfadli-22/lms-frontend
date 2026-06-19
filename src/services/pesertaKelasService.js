// src/services/pesertaKelasService.js
import api from "../config/api";

/**
 * Memetakan satu item peserta dari response API ke shape yang dipakai FE.
 */
const mapPeserta = (item) => ({
  id_peserta: item.id_peserta,
  id_jadwal: item.id_jadwal,
  id_mahasiswa: item.id_mahasiswa,
  tanggal_daftar: item.tanggal_daftar ?? null,
  evaluasi_selesai: item.evaluasi_selesai ?? false,
  kehadiran: item.kehadiran ?? "0/0",
  nilai_akhir: item.nilai_akhir ?? 0,
  status_kelayakan: item.status_kelayakan ?? "Belum Ditentukan",
  // Relasi mahasiswa
  nama_mahasiswa: item.mahasiswa?.nama_lengkap ?? "-",
  nim: item.mahasiswa?.nomor_induk ?? "-",
  email_mahasiswa: item.mahasiswa?.email ?? "-",
  mahasiswa: item.mahasiswa ?? null,
});

const pesertaKelasService = {
  /**
   * Ambil daftar peserta yang terdaftar pada satu jadwal perkuliahan.
   * Digunakan oleh Admin & Dosen untuk melihat siapa saja mahasiswa di kelas mereka.
   * @param {string} id_jadwal
   */
  getByJadwal: async (id_jadwal) => {
    const res = await api.get(`/jadwal/${id_jadwal}/peserta`);
    const items = res.data.data ?? [];
    return Array.isArray(items) ? items.map(mapPeserta) : [];
  },
};

export default pesertaKelasService;
