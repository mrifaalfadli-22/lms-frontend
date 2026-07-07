import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useMataKuliah } from "../../hooks/useMataKuliah";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahMataKuliahModal from "../../components/admin/TambahMataKuliahModal";
import UbahMataKuliahModal from "../../components/admin/UbahMataKuliahModal";
import DetailMataKuliahModal from "../../components/admin/DetailMataKuliahModal";
import Pagination from "../../components/common/Pagination";
import { formatFakultas } from "../../utils/formatters";
import { fakultasData } from "../../data/fakultasData";
import { mataKuliahService } from "../../services/mataKuliahService";
import ExcelJS from "exceljs";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);
const SKS_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function DaftarMataKuliah() {
  const { mataKuliah, loading, error, pagination, fetchPage, debouncedFetch, tambah, update, hapus } =
    useMataKuliah();

  const [search, setSearch] = useState("");
  const [sksFilter, setSksFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
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
      if (sksFilter) params.sks = sksFilter;
      if (fakultasFilter) params.fakultas = fakultasFilter;
      if (prodiFilter) params.prodi = prodiFilter;
      return params;
    },
    [search, semesterFilter, sksFilter, fakultasFilter, prodiFilter, itemsPerPage],
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
    if (sksFilter) params.sks = sksFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    debouncedFetch(params);
  };

  const handleSemesterChange = (e) => {
    const value = e.target.value;
    setSemesterFilter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (value) params.semester = value;
    if (sksFilter) params.sks = sksFilter;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    fetchPage(params);
  };

  const handleSksChange = (e) => {
    const value = e.target.value;
    setSksFilter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (value) params.sks = value;
    if (fakultasFilter) params.fakultas = fakultasFilter;
    if (prodiFilter) params.prodi = prodiFilter;
    fetchPage(params);
  };

  const handleFakultasChange = (e) => {
    const value = e.target.value;
    setFakultasFilter(value);
    setProdiFilter(""); // reset prodi

    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (sksFilter) params.sks = sksFilter;
    if (value) params.fakultas = value;
    fetchPage(params);
  };

  const handleProdiChange = (e) => {
    const value = e.target.value;
    setProdiFilter(value);

    const params = { page: 1 };
    if (search) params.search = search;
    if (semesterFilter) params.semester = semesterFilter;
    if (sksFilter) params.sks = sksFilter;
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
      await hapus(deleteTarget.id_mk);
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
      const res = await mataKuliahService.getPage(params);
      const dataToExport = res.data;

      if (!dataToExport || dataToExport.length === 0) {
        alert("Tidak ada data untuk dieksport.");
        setIsExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Data Mata Kuliah");

      // Styling Header
      const headerRow = sheet.addRow(["No", "Kode MK", "Nama Mata Kuliah", "Fakultas", "Program Studi", "Semester", "SKS"]);
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
          item.kode_mk || "-",
          item.nama_mk || "-",
          formatFakultas(item.fakultas) || "-",
          item.prodi || "-",
          item.semester ? `Semester ${item.semester}` : "-",
          item.sks ? `${item.sks} SKS` : "-",
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
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(6).alignment = { horizontal: "center" };
        row.getCell(7).alignment = { horizontal: "center" };
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
      link.download = `Data_Mata_Kuliah_${date}.xlsx`;
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
      <TambahMataKuliahModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />
      <UbahMataKuliahModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
      <DetailMataKuliahModal
        isOpen={!!detailTarget}
        data={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Mata Kuliah"
        fields={[
          { label: "Kode MK", key: "kode_mk" },
          { label: "Nama", key: "nama_mk" },
          { label: "Fakultas", key: "fakultas" },
          { label: "Program Studi", key: "prodi" },
          { label: "SKS", key: "sks" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Mata Kuliah
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
              Tambah Mata Kuliah
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
              placeholder="Cari kode, nama, fakultas, atau prodi..."
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
            onChange={handleSemesterChange}
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
            value={sksFilter}
            onChange={handleSksChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua SKS</option>
            {SKS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} SKS
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
            <div className="flex justify-center py-16">
              <p className="text-[14px] font-bold text-red-500">{error}</p>
            </div>
          ) : mataKuliah.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <BookOpen size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || semesterFilter || sksFilter || fakultasFilter || prodiFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada data mata kuliah."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || semesterFilter || sksFilter || fakultasFilter || prodiFilter
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
                    "Kode MK",
                    "Nama Mata Kuliah",
                    "Fakultas",
                    "Program Studi",
                    "Semester",
                    "SKS",
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
                {mataKuliah.map((mk, i) => (
                  <tr
                    key={mk.id_mk || i}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(pagination?.current_page - 1) * pagination?.per_page + i + 1 || i + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(mk.kode_mk)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(mk.nama_mk)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {formatFakultas(val(mk.fakultas))}
                    </td>
                    <td className="py-4 px-4 text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {val(mk.prodi)}
                    </td>
                    <td className="py-4 px-4 text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {mk.semester ? `Semester ${mk.semester}` : "-"}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {mk.sks ? (
                        <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          {mk.sks} SKS
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailTarget(mk)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Lihat</span>
                        </button>
                        <button
                          onClick={() => setEditTarget(mk)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Edit2 size={14} />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(mk)}
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
        {!loading && !error && mataKuliah.length > 0 && (
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
