// src/services/jadwalService.js
import api from "../config/api";

const BASE = "/jadwal-perkuliahan";

/**
 * Helper: Ambil semua halaman dari endpoint paginated.
 */
const fetchAllPages = async (endpoint, params = {}) => {
  const firstRes = await api.get(endpoint, { params: { ...params, page: 1 } });
  const { data: firstData, total, per_page } = firstRes.data;

  let allItems = [...firstData];

  const totalPages = Math.ceil(total / per_page);
  if (totalPages > 1) {
    const promises = [];
    for (let page = 2; page <= totalPages; page++) {
      promises.push(api.get(endpoint, { params: { ...params, page } }));
    }
    const results = await Promise.all(promises);
    results.forEach((res) => {
      allItems = allItems.concat(res.data.data);
    });
  }

  return allItems;
};

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
});

const jadwalService = {
  getAll: async () => {
    const allData = await fetchAllPages(BASE);
    return allData.map(mapJadwal);
  },

  getPage: async (page = 1) => {
    const res = await api.get(BASE, { params: { page } });
    return {
      data: res.data.data.map(mapJadwal),
      total: res.data.total,
      per_page: res.data.per_page,
      current_page: res.data.current_page,
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
  // ============================================================

  getMataKuliahOptions: async () => {
    try {
      const allItems = await fetchAllPages("/mata-kuliah");
      return allItems.map((mk) => ({
        value: mk.id_mk,
        label: `${mk.kode_mk} - ${mk.nama_mk} (${mk.sks} SKS)`,
        // Bawa sks & semester supaya form bisa auto-fill
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
      const allItems = await fetchAllPages("/kelas");
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
      const allItems = await fetchAllPages("/verifikasi-dosen", {
        status: "Disetujui",
      });
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
      // Fallback dari data jadwal
      try {
        const allJadwal = await jadwalService.getAll();
        const seen = new Set();
        return allJadwal.reduce((acc, j) => {
          if (j.id_dosen && j.nama_dosen !== "-" && !seen.has(j.id_dosen)) {
            seen.add(j.id_dosen);
            acc.push({
              value: j.id_dosen,
              label: `${j.nama_dosen} (${j.nidn !== "-" ? j.nidn : "-"})`,
            });
          }
          return acc;
        }, []);
      } catch (fallbackError) {
        console.error("Gagal memuat data dosen fallback:", fallbackError);
        return [];
      }
    }
  },
};

export default jadwalService;
