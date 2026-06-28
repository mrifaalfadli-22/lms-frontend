// src/services/jadwalService.js
import api from "../config/api";

const BASE = "/jadwal-perkuliahan";

/**
 * Memetakan satu item jadwal dari response API ke shape yang dipakai FE.
 */
const mapJadwal = (item) => ({
  id_jadwal: item.id_jadwal,
  // Relasi mata kuliah
  id_mk: item.id_mk,
  nama_mk: item.mata_kuliah?.nama_mk ?? "-",
  kode_mk: item.mata_kuliah?.kode_mk ?? "-",
  // SKS & semester diambil dari field langsung di jadwal (BE sudah set otomatis)
  sks: item.sks ?? item.mata_kuliah?.sks ?? "-",
  // Relasi kelas
  id_kelas: item.id_kelas,
  kelas: item.kelas?.nama_kelas ?? "-",
  kode_kelas: item.kelas?.kode_kelas ?? "-",
  // Relasi dosen
  id_dosen: item.id_dosen,
  nama_dosen: item.dosen?.nama_lengkap ?? "-",
  nidn: item.dosen?.nomor_induk ?? "-",
  // Jadwal
  hari: item.hari,
  waktu_mulai: item.waktu_mulai,
  waktu_berakhir: item.waktu_berakhir,
  waktu:
    item.waktu_mulai && item.waktu_berakhir
      ? `${item.waktu_mulai.substring(0, 5)} - ${item.waktu_berakhir.substring(0, 5)}`
      : "-",
  // Semester (integer 1-14), tahun ajaran (string "2025/2026")
  semester: item.semester ?? null,
  tahun: item.tahun ?? "-",
  // Fakultas & Prodi (field langsung di jadwal)
  fakultas: item.fakultas ?? "-",
  prodi: item.prodi ?? "-",
  // Token
  token_enrollment: item.token_enrollment,
  tanggal_mulai: item.tanggal_mulai,
});

const jadwalService = {
  /**
   * Ambil data jadwal dengan server-side pagination, search, dan filter.
   * @param {Object} params - { page, search, semester, tahun, hari, per_page }
   */
  getPage: async (params = {}) => {
    const res = await api.get(BASE, { params });
    return {
      data: (res.data.data || []).map(mapJadwal),
      total: res.data.total || 0,
      per_page: res.data.per_page || 20,
      current_page: res.data.current_page || 1,
      last_page: res.data.last_page || 1,
    };
  },

  /**
   * Ambil jadwal yang sudah dikelompokkan per dosen + MK dari endpoint BE.
   * Response sudah berisi jumlah_kelas dan kelas_list yang akurat.
   */
  getGrouped: async (params = {}) => {
    const res = await api.get(`${BASE}/grouped`, { params });
    const items = res.data.data || [];
    return {
      data: items.map((item) => ({
        id_jadwal:    item.id_jadwal,
        id_mk:        item.id_mk,
        id_dosen:     item.id_dosen,
        kode_mk:      item.kode_mk ?? "-",
        nama_mk:      item.nama_mk ?? "-",
        sks:          item.sks ?? "-",
        deskripsi:    item.deskripsi ?? "",
        nama_dosen:   item.nama_dosen ?? "-",
        nidn:         item.nidn ?? "-",
        fakultas:     item.fakultas ?? "-",
        prodi:        item.prodi ?? "-",
        semester:     item.semester ?? null,
        tahun:        item.tahun ?? "-",
        jumlah_kelas: item.jumlah_kelas ?? 0,
        kelas_list:   item.kelas_list ?? [],
      })),
      total:        res.data.total || 0,
      per_page:     res.data.per_page || 20,
      current_page: res.data.current_page || 1,
      last_page:    res.data.last_page || 1,
    };
  },

  /**
   * Cari group berdasarkan id_jadwal (dipakai sebagai fallback saat user refresh halaman detail).
   * Fetch semua grouped dengan per_page besar, lalu cari group yang mengandung id_jadwal tsb.
   */
  getGroupedByJadwalId: async (id_jadwal) => {
    // Ambil dengan limit besar; karena sudah grouped, jumlahnya jauh lebih sedikit dari raw jadwal
    const res = await api.get(`${BASE}/grouped`, { params: { per_page: 200 } });
    const items = res.data.data || [];
    // Cari group yang memiliki id_jadwal pertama (representative) ATAU yang ada di kelas_list
    const found = items.find(
      (item) =>
        item.id_jadwal === id_jadwal ||
        (item.kelas_list || []).some((k) => k.id_jadwal === id_jadwal)
    );
    if (!found) return null;
    return {
      id_jadwal:    found.id_jadwal,
      id_mk:        found.id_mk,
      id_dosen:     found.id_dosen,
      kode_mk:      found.kode_mk ?? "-",
      nama_mk:      found.nama_mk ?? "-",
      sks:          found.sks ?? "-",
      deskripsi:    found.deskripsi ?? "",
      nama_dosen:   found.nama_dosen ?? "-",
      nidn:         found.nidn ?? "-",
      fakultas:     found.fakultas ?? "-",
      prodi:        found.prodi ?? "-",
      semester:     found.semester ?? null,
      tahun:        found.tahun ?? "-",
      jumlah_kelas: found.jumlah_kelas ?? 0,
      kelas_list:   found.kelas_list ?? [],
    };
  },


  getById: async (id) => {
    const res = await api.get(`${BASE}/${id}`);
    return mapJadwal(res.data);
  },

  /**
   * Tambah jadwal baru.
   * sks & token_enrollment TIDAK dikirim — otomatis dari BE.
   * semester = integer (1-14), tahun = string "2025/2026"
   */
  create: async (payload) => {
    const res = await api.post(BASE, payload);
    return res.data;
  },

  /**
   * Update jadwal.
   * Jika id_mk berubah, BE otomatis update sks.
   */
  update: async (id, payload) => {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },

  // ============================================================
  // DROPDOWN OPTIONS UNTUK FORM
  // Menggunakan per_page=100 agar cukup untuk dropdown
  // ============================================================

  getMataKuliahOptions: async () => {
    try {
      const res = await api.get("/mata-kuliah", { params: { per_page: 100 } });
      const allItems = res.data.data || [];
      return allItems.map((mk) => ({
        value: mk.id_mk,
        label: `${mk.kode_mk} - ${mk.nama_mk} (${mk.sks} SKS)`,
        sks: mk.sks,
        semester: mk.semester,
        fakultas: mk.fakultas,
        prodi: mk.prodi,
      }));
    } catch (error) {
      console.error("Gagal memuat data mata kuliah:", error);
      return [];
    }
  },

  getKelasOptions: async () => {
    try {
      const res = await api.get("/kelas", { params: { per_page: 100 } });
      const allItems = res.data.data || [];
      return allItems.map((k) => ({
        value: k.id_kelas,
        label: `${k.kode_kelas} - ${k.nama_kelas} (Angkatan ${k.tahun_angkatan})`,
      }));
    } catch (error) {
      console.error("Gagal memuat data kelas:", error);
      return [];
    }
  },

  getDosenOptions: async () => {
    try {
      const res = await api.get("/verifikasi-dosen", {
        params: { status: "Disetujui", per_page: 100 },
      });
      const allItems = res.data.data || [];
      const dosenAktif = allItems.filter(
        (d) => d.status_aktif === true || d.status_aktif === 1,
      );
      if (dosenAktif.length === 0) throw new Error("Tidak ada dosen aktif");
      return dosenAktif.map((d) => ({
        value: d.id_user,
        label: `${d.nama_lengkap} (${d.nomor_induk || d.email || d.id_user})`,
      }));
    } catch (error) {
      console.error("Gagal memuat data dosen:", error.message);
      return [];
    }
  },
};

export default jadwalService;
