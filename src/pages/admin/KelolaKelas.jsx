import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Layout,
} from "lucide-react";
import { useKelas } from "../../hooks/useKelas";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahKelasModal from "../../components/admin/TambahKelasModal";
import UbahKelasModal from "../../components/admin/UbahKelasModal";
import DetailKelasModal from "../../components/admin/DetailKelasModal";
import Pagination from "../../components/common/Pagination";
import { formatFakultas } from "../../utils/formatters";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function KelolaKelas() {
  const { kelas, loading, error, pagination, fetchPage, debouncedFetch, tambah, update, hapus } =
    useKelas();

  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");

  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bangun params dari state lokal
  const buildParams = useCallback(
    (page = 1, limit = itemsPerPage) => {
      const params = { page, per_page: limit };
      if (search) params.search = search;
      if (tahunFilter) params.tahun_angkatan = tahunFilter;
      if (fakultasFilter) params.fakultas = fakultasFilter;
      if (prodiFilter) params.prodi = prodiFilter;
      return params;
    },
    [search, tahunFilter, fakultasFilter, prodiFilter, itemsPerPage],
  );

  // Fetch awal saat mount
  useEffect(() => {
    fetchPage(buildParams(1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch saat filter berubah (debounced untuk search)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = { page: 1 };
    if (value) params.search = value;
    if (tahunFilter) params.tahun_angkatan = tahunFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    debouncedFetch(params);
  };

  const handleTahunChange = (e) => {
    const value = e.target.value;
    setTahunFilter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (value) params.tahun_angkatan = value;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    fetchPage(params);
  };

  const handleFakultasChange = (e) => {
    const value = e.target.value;
    setFakultasFilter(value);
    // Reset prodi saat fakultas berubah
    setProdiFilter("");
    const params = { page: 1 };
    if (search) params.search = search;
    if (tahunFilter) params.tahun_angkatan = tahunFilter;
    if (value) params.fakultas = value;
    fetchPage(params);
  };

  const handleProdiChange = (e) => {
    const value = e.target.value;
    setProdiFilter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (tahunFilter) params.tahun_angkatan = tahunFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (value) params.prodi = value;
    fetchPage(params);
  };

  const handlePageChange = (page) => {
    fetchPage(buildParams(page));
  };

  const handlePerPageChange = (newPerPage) => {
    setItemsPerPage(newPerPage);
    fetchPage(buildParams(1, newPerPage));
  };

  const handleTambahSuccess = async (values) => {
    await tambah(values);
    setShowTambah(false);
  };

  const handleEditSuccess = async (id, values) => {
    try {
      await update(id, values);
      setEditTarget(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await hapus(deleteTarget.id_kelas);
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus data kelas.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <TambahKelasModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />
      <UbahKelasModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
      <DetailKelasModal
        isOpen={!!detailTarget}
        data={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Data Kelas"
        fields={[
          { label: "Kode Kelas", key: "kode_kelas" },
          { label: "Nama Kelas", key: "nama_kelas" },
          { label: "Tahun Angkatan", key: "tahun_angkatan" },
          { label: "Fakultas", key: "fakultas" },
          { label: "Program Studi", key: "prodi" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Kelas
          </h3>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all">
              <Download size={14} />
              Eksport Data
            </button>
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
            >
              <Plus size={14} />
              Tambah Kelas
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 px-7 pb-5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              size={15}
              strokeWidth={2.5}
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari nama, kode, fakultas, atau prodi..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>

          {/* Filter Tahun Angkatan */}
          <select
            value={tahunFilter}
            onChange={handleTahunChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Tahun Angkatan</option>
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Filter Fakultas */}
          <select
            value={fakultasFilter}
            onChange={handleFakultasChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Fakultas</option>
            <option value="Teknik">Teknik</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Hukum">Hukum</option>
            <option value="FKIP">FKIP</option>
            <option value="Pertanian">Pertanian</option>
            <option value="Agama Islam">Agama Islam</option>
            <option value="Ilmu Sosial">Ilmu Sosial</option>
          </select>

          {/* Filter Program Studi */}
          <select
            value={prodiFilter}
            onChange={handleProdiChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Program Studi</option>
            {fakultasFilter === "Teknik" && (
              <>
                <option value="Informatika">Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Teknik Sipil">Teknik Sipil</option>
                <option value="Teknik Elektro">Teknik Elektro</option>
                <option value="Teknik Mesin">Teknik Mesin</option>
              </>
            )}
            {fakultasFilter === "Ekonomi" && (
              <>
                <option value="Manajemen">Manajemen</option>
                <option value="Akuntansi">Akuntansi</option>
                <option value="Ekonomi Pembangunan">Ekonomi Pembangunan</option>
              </>
            )}
            {fakultasFilter === "Hukum" && (
              <option value="Ilmu Hukum">Ilmu Hukum</option>
            )}
            {fakultasFilter === "FKIP" && (
              <>
                <option value="Pendidikan Matematika">Pendidikan Matematika</option>
                <option value="Pendidikan Bahasa Indonesia">Pendidikan Bahasa Indonesia</option>
                <option value="Pendidikan Bahasa Inggris">Pendidikan Bahasa Inggris</option>
                <option value="PGSD">PGSD</option>
              </>
            )}
            {fakultasFilter === "Pertanian" && (
              <>
                <option value="Agroteknologi">Agroteknologi</option>
                <option value="Agribisnis">Agribisnis</option>
              </>
            )}
            {fakultasFilter === "Agama Islam" && (
              <>
                <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                <option value="Hukum Ekonomi Syariah">Hukum Ekonomi Syariah</option>
                <option value="Komunikasi Penyiaran Islam">Komunikasi Penyiaran Islam</option>
              </>
            )}
            {fakultasFilter === "Ilmu Sosial" && (
              <>
                <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                <option value="Administrasi Publik">Administrasi Publik</option>
              </>
            )}
            {/* Jika belum pilih fakultas, tampilkan semua prodi */}
            {!fakultasFilter && (
              <>
                <option value="Informatika">Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Manajemen">Manajemen</option>
                <option value="Akuntansi">Akuntansi</option>
                <option value="Ilmu Hukum">Ilmu Hukum</option>
                <option value="Pendidikan Matematika">Pendidikan Matematika</option>
                <option value="Agroteknologi">Agroteknologi</option>
                <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
              </>
            )}
          </select>

          {/* Tombol Reset Filter */}
          {(fakultasFilter || prodiFilter || tahunFilter || search) && (
            <button
              onClick={() => {
                setSearch("");
                setTahunFilter("");
                setFakultasFilter("");
                setProdiFilter("");
                fetchPage({ page: 1, per_page: itemsPerPage });
              }}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-red-500 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 transition-all whitespace-nowrap"
            >
              ✕ Reset Filter
            </button>
          )}
        </div>

        {/* Table / State */}
        <div className="px-7 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[13px]">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center py-16">
              <p className="text-[14px] font-bold text-red-500">{error}</p>
            </div>
          ) : kelas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <Layout size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || tahunFilter || fakultasFilter || prodiFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada data kelas."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || tahunFilter || fakultasFilter || prodiFilter
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Data akan muncul setelah ditambahkan ke sistem."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "No",
                    "Kode Kelas",
                    "Nama Kelas",
                    "Fakultas",
                    "Program Studi",
                    "Tahun Angkatan",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#1E293B]">
                {kelas.map((k, i) => (
                  <tr
                    key={k.id_kelas || i}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(pagination?.current_page - 1) * pagination?.per_page + i + 1 || i + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      <span className="bg-[#F1F5F9] px-3 py-1 rounded-lg text-[13px]">
                        {val(k.kode_kelas)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(k.nama_kelas)}
                    </td>
                    <td className="py-4 px-4 text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {formatFakultas(val(k.fakultas))}
                    </td>
                    <td className="py-4 px-4 text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(k.prodi)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                        {val(k.tahun_angkatan)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailTarget(k)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Lihat</span>
                        </button>
                        <button
                          onClick={() => setEditTarget(k)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Edit2 size={14} />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(k)}
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && kelas.length > 0 && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        )}
      </div>
    </>
  );
}
