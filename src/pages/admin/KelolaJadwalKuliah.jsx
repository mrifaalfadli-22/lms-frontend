// src/pages/admin/DaftarJadwalKuliah.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useJadwalKuliah } from "../../hooks/useJadwalKuliah";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahJadwalModal from "../../components/admin/TambahJadwalModal";
import UbahJadwalModal from "../../components/admin/UbahJadwalModal";
import DetailJadwalModal from "../../components/admin/DetailJadwalModal";
import Pagination from "../../components/common/Pagination";
import { TAHUN_AJARAN_OPTIONS } from "../../schemas/jadwalSchema";
import { formatFakultas } from "../../utils/formatters";
import { fakultasData } from "../../data/fakultasData";
import jadwalService from "../../services/jadwalService";
import ExcelJS from "exceljs";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function DaftarJadwalKuliah() {
  const { jadwal, loading, error, pagination, fetchPage, debouncedFetchPage, tambah, update, hapus } =
    useJadwalKuliah();

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [hariFilter, setHariFilter] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");

  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const buildParams = useCallback(
    (page = 1, limit = itemsPerPage) => {
      const params = { page, per_page: limit };
      if (search) params.search = search;
      if (semesterFilter) params.semester = semesterFilter;
      if (tahunFilter) params.tahun = tahunFilter;
      if (hariFilter) params.hari = hariFilter;
      if (fakultasFilter) params.fakultas = fakultasFilter;
      if (prodiFilter) params.prodi = prodiFilter;
      return params;
    },
    [search, semesterFilter, tahunFilter, hariFilter, fakultasFilter, prodiFilter, itemsPerPage],
  );

  // Fetch awal
  useEffect(() => {
    fetchPage(buildParams(1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = { page: 1 };
    if (value) params.search = value;
    if (semesterFilter) params.semester = semesterFilter;
    if (tahunFilter) params.tahun = tahunFilter;
    if (hariFilter) params.hari = hariFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    debouncedFetchPage(params);
  };

  const handleFilterChange = (setter, key) => (e) => {
    const value = e.target.value;
    setter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (tahunFilter) params.tahun = tahunFilter;
    if (hariFilter) params.hari = hariFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    if (value) params[key] = value;
    else delete params[key];
    fetchPage(params);
  };

  const handleFakultasChange = (e) => {
    const value = e.target.value;
    setFakultasFilter(value);
    setProdiFilter(""); // reset prodi

    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (tahunFilter) params.tahun = tahunFilter;
    if (hariFilter) params.hari = hariFilter;
    if (value) params.fakultas = value;
    fetchPage(params);
  };

  const handleProdiChange = (e) => {
    const value = e.target.value;
    setProdiFilter(value);

    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (tahunFilter) params.tahun = tahunFilter;
    if (hariFilter) params.hari = hariFilter;
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
    try {
      await tambah(values);
      setShowTambah(false);
    } catch (err) {
      throw err;
    }
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
      await hapus(deleteTarget.id_jadwal);
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus data.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const params = buildParams(1, 10000);
      const res = await jadwalService.getPage(params);
      const dataToExport = res.data;

      if (!dataToExport || dataToExport.length === 0) {
        alert("Tidak ada data untuk dieksport.");
        setIsExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Data Jadwal Kuliah");

      // Styling Header
      const headerRow = sheet.addRow(["No", "Mata Kuliah", "Kelas", "Fakultas", "Program Studi", "Dosen", "Hari", "Waktu", "Semester", "Tahun Ajaran"]);
      headerRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF167A61" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });
      headerRow.height = 25;

      // Data Rows
      dataToExport.forEach((item, index) => {
        const row = sheet.addRow([
          index + 1,
          item.nama_mk || "-",
          item.kelas || "-",
          formatFakultas(item.fakultas) || "-",
          item.prodi || "-",
          item.nama_dosen || "-",
          item.hari || "-",
          (item.waktu_mulai && item.waktu_berakhir) ? `${item.waktu_mulai.substring(0, 5)} - ${item.waktu_berakhir.substring(0, 5)}` : "-",
          item.semester !== null ? `Semester ${item.semester}` : "-",
          item.tahun || "-",
        ]);

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
          cell.border = {
            top: { style: "thin", color: { argb: "FFEEEEEE" } },
            left: { style: "thin", color: { argb: "FFEEEEEE" } },
            bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
            right: { style: "thin", color: { argb: "FFEEEEEE" } },
          };
        });
        
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "center" };
        row.getCell(8).alignment = { horizontal: "center" };
        row.getCell(9).alignment = { horizontal: "center" };
        row.getCell(10).alignment = { horizontal: "center" };
      });

      // Auto-fit columns
      sheet.columns.forEach((column) => {
        let maxLength = 0;
        column["eachCell"]({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `Data_Jadwal_Kuliah_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengeksport data:", error);
      alert("Terjadi kesalahan saat mengeksport data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <TambahJadwalModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />
      <UbahJadwalModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
      <DetailJadwalModal
        isOpen={!!detailTarget}
        data={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Jadwal Kuliah"
        fields={[
          { label: "Mata Kuliah", key: "nama_mk" },
          { label: "Kelas", key: "kelas" },
          { label: "Dosen", key: "nama_dosen" },
          { label: "Hari", key: "hari" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Jadwal Kuliah
          </h3>
          <div className="flex gap-2.5">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? "Mengeksport..." : "Eksport Data"}
            </button>
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
            >
              <Plus size={14} />
              Tambah Jadwal
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
              placeholder="Cari mata kuliah, dosen, kelas..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>

          <select
            value={fakultasFilter}
            onChange={handleFakultasChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Fakultas</option>
            {fakultasData.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={prodiFilter}
            onChange={handleProdiChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Prodi</option>
            {(fakultasFilter
              ? fakultasData.find((f) => f.value === fakultasFilter)?.prodi || []
              : [...new Set(fakultasData.flatMap((f) => f.prodi.map((p) => p.value)))].sort().map(value => ({ value, label: value }))
            ).map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={handleFilterChange(setSemesterFilter, "semester")}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Semester</option>
            {SEMESTER_OPTIONS.map((s) => (
              <option key={s} value={String(s)}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={tahunFilter}
            onChange={handleFilterChange(setTahunFilter, "tahun")}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Tahun Ajaran</option>
            {TAHUN_AJARAN_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={hariFilter}
            onChange={handleFilterChange(setHariFilter, "hari")}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Hari</option>
            {HARI_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="px-7 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[13px]">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[14px] font-bold text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[13px] text-[#167A61] font-semibold hover:underline"
              >
                Muat ulang halaman
              </button>
            </div>
          ) : jadwal.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <CalendarDays size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || semesterFilter || tahunFilter || hariFilter || fakultasFilter || prodiFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada data jadwal kuliah."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || semesterFilter || tahunFilter || hariFilter || fakultasFilter || prodiFilter
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
                    "Mata Kuliah",
                    "Kelas",
                    "Fakultas",
                    "Program Studi",
                    "Dosen",
                    "Hari",
                    "Waktu",
                    "Semester",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#1E293B]">
                {jadwal.map((j, i) => (
                  <tr
                    key={j.id_jadwal || i}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(pagination?.current_page - 1) * pagination?.per_page + i + 1 || i + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(j.nama_mk)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {val(j.kelas)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {formatFakultas(val(j.fakultas))}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-[13px]">
                      {val(j.prodi)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {val(j.nama_dosen)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {j.hari ? (
                        <span className="bg-[#FFF7ED] text-[#C2410C] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          {j.hari}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-[13px]">
                      {j.waktu_mulai && j.waktu_berakhir
                        ? `${j.waktu_mulai.substring(0, 5)} - ${j.waktu_berakhir.substring(0, 5)}`
                        : "-"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {j.semester !== null && j.semester !== undefined ? (
                        <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black">
                          Semester {j.semester}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailTarget(j)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Lihat</span>
                        </button>
                        <button
                          onClick={() => setEditTarget(j)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Edit2 size={14} />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(j)}
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
        {!loading && !error && jadwal.length > 0 && (
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
