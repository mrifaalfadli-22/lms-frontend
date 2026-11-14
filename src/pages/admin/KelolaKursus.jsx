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
import { useKursus } from "../../hooks/useKursus";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahKursusModal from "../../components/admin/TambahKursusModal";
import UbahKursusModal from "../../components/admin/UbahKursusModal";
import DetailKursusModal from "../../components/admin/DetailKursusModal";
import Pagination from "../../components/common/Pagination";
import { kursusService } from "../../services/kursusService";
import ExcelJS from "exceljs";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);


export default function KelolaKursus() {
  const { mataKuliah, loading, error, pagination, fetchPage, debouncedFetch, tambah, update, hapus } =
    useKursus();

  const [search, setSearch] = useState("");

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
      return params;
    },
    [search, itemsPerPage],
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
    debouncedFetch(params);
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
      const res = await kursusService.getPage(params);
      const dataToExport = res.data;

      if (!dataToExport || dataToExport.length === 0) {
        alert("Tidak ada data untuk dieksport.");
        setIsExporting(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Data Kursus");

      // Styling Header
      const headerRow = sheet.addRow(["No", "Kode Kursus", "Nama Kursus"]);
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
      link.download = `Data_Kursus_${date}.xlsx`;
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
      <TambahKursusModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />
      <UbahKursusModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
      <DetailKursusModal
        isOpen={!!detailTarget}
        data={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Kursus"
        fields={[
          { label: "Kode Kursus", key: "kode_mk" },
          { label: "Nama", key: "nama_mk" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Kursus
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
              Tambah Kursus
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
              placeholder="Cari kode atau nama kursus..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
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
                {search
                  ? "Data tidak ditemukan."
                  : "Belum ada data kursus."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search
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
                    "Kode Kursus",
                    "Nama Kursus",
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
