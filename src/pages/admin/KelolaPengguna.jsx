import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  BookOpen,
  Users,
  Loader2,
} from "lucide-react";
import { usePengguna } from "../../hooks/usePengguna";
import { penggunaService } from "../../services/penggunaService";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahMahasiswaModal from "../../components/admin/TambahMahasiswaModal";
import UbahMahasiswaModal from "../../components/admin/UbahMahasiswaModal";
import UbahDosenModal from "../../components/admin/UbahDosenModal";
import Pagination from "../../components/common/Pagination";
import { formatFakultas } from "../../utils/formatters";
import { fakultasData } from "../../data/fakultasData";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const TABS = [
  { key: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
  { key: "dosen", label: "Dosen", icon: BookOpen },
];

function EmptyState({ message, hasFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
        <Users size={28} className="text-[#94A3B8]" />
      </div>
      <p className="text-[14px] font-bold text-[#64748B]">{message}</p>
      <p className="text-[13px] text-[#94A3B8] mt-1">
        {hasFilter
          ? "Coba ubah kata kunci atau filter pencarian."
          : "Data akan muncul setelah ditambahkan ke sistem."}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-[13px]">Memuat data...</span>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[14px] font-bold text-red-500">{message}</p>
    </div>
  );
}

function UserTable({
  data,
  identifierLabel,
  tahunLabel,
  identifierKey,
  loading,
  error,
  emptyMessage,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  onStatusChange,
  onTahunChange,
  onFakultasChange,
  onProdiChange,
  search,
  statusFilter,
  tahunFilter,
  fakultasFilter,
  prodiFilter,
}) {
  const getTahun = (r) => {
    if (identifierLabel === "NPM") return val(r.angkatan);
    return r.created_at ? new Date(r.created_at).getFullYear().toString() : "-";
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <>
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
            onChange={onSearchChange}
            placeholder={`Cari nama, email, atau ${identifierLabel}...`}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
          />
        </div>

        {identifierLabel === "NPM" && (
          <select
            value={tahunFilter}
            onChange={onTahunChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua {tahunLabel}</option>
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={onStatusChange}
          className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
        </select>

        <select
          value={fakultasFilter}
          onChange={onFakultasChange}
          className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
        >
          <option value="">Semua Fakultas</option>
          {fakultasData.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        
        <select
          value={prodiFilter}
          onChange={onProdiChange}
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
      </div>

      <div className="px-7 overflow-x-auto">
        {data.length === 0 ? (
          <EmptyState
            message={
              search || statusFilter || tahunFilter || fakultasFilter || prodiFilter
                ? "Data tidak ditemukan."
                : emptyMessage
            }
            hasFilter={!!(search || statusFilter || tahunFilter || fakultasFilter || prodiFilter)}
          />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {[
                  "No",
                  "Nama",
                  identifierLabel,
                  "Email",
                  "Fakultas",
                  "Program Studi",
                  tahunLabel,
                  "Status",
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
              {data.map((r, i) => {
                const isAktif = r.status_aktif === true;
                return (
                  <tr
                    key={r.id_user || i}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {(pagination?.current_page - 1) * pagination?.per_page + i + 1 || i + 1}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r.nama_lengkap)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r[identifierKey])}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r.email)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {formatFakultas(val(r.fakultas))}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r.prodi)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {getTahun(r)}
                    </td>
                    <td className="py-4 px-4">
                      {isAktif ? (
                        <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          Aktif
                        </span>
                      ) : (
                        <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(r)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Edit2 size={14} />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
        />
      )}
    </>
  );
}

export default function KelolaPengguna() {
  const [activeTab, setActiveTab] = useState("mahasiswa");
  const {
    mahasiswa,
    setMahasiswa,
    dosen,
    loading,
    loadingMhs,
    loadingDosen,
    error,
    paginationMhs,
    paginationDosen,
    fetchMahasiswa,
    fetchDosen,
    debouncedFetchMahasiswa,
    debouncedFetchDosen,
    tambahMahasiswa,
    updateMahasiswa,
    updateDosen,
    deleteDosen,
  } = usePengguna(activeTab);

  // Search & filter state per tab
  const [searchMhs, setSearchMhs] = useState("");
  const [statusMhs, setStatusMhs] = useState("");
  const [tahunMhs, setTahunMhs] = useState("");
  const [fakultasMhs, setFakultasMhs] = useState("");
  const [prodiMhs, setProdiMhs] = useState("");

  const [searchDosen, setSearchDosen] = useState("");
  const [statusDosen, setStatusDosen] = useState("");
  const [fakultasDosen, setFakultasDosen] = useState("");
  const [prodiDosen, setProdiDosen] = useState("");

  const [showTambah, setShowTambah] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDosenTarget, setDeleteDosenTarget] = useState(null);
  const [deleteDosenLoading, setDeleteDosenLoading] = useState(false);

  const [editMahasiswaTarget, setEditMahasiswaTarget] = useState(null);
  const [editDosenTarget, setEditDosenTarget] = useState(null);

  const [isExporting, setIsExporting] = useState(false);

  const isMahasiswa = activeTab === "mahasiswa";

  const [itemsPerPageMhs, setItemsPerPageMhs] = useState(10);
  const [itemsPerPageDosen, setItemsPerPageDosen] = useState(10);

  // Build params helpers
  const buildMhsParams = useCallback(
    (page = 1, limit = itemsPerPageMhs, overrides = {}) => {
      const params = { page, per_page: limit };
      const s = overrides.search !== undefined ? overrides.search : searchMhs;
      const st = overrides.status !== undefined ? overrides.status : statusMhs;
      const t = overrides.tahun !== undefined ? overrides.tahun : tahunMhs;
      const f = overrides.fakultas !== undefined ? overrides.fakultas : fakultasMhs;
      const p = overrides.prodi !== undefined ? overrides.prodi : prodiMhs;

      if (s) params.search = s;
      if (st) params.status_aktif = st === "AKTIF" ? "true" : "false";
      if (t) params.angkatan = t;
      if (f) params.fakultas = f;
      if (p) params.prodi = p;
      return params;
    },
    [searchMhs, statusMhs, tahunMhs, fakultasMhs, prodiMhs, itemsPerPageMhs],
  );

  const buildDosenParams = useCallback(
    (page = 1, limit = itemsPerPageDosen, overrides = {}) => {
      const params = { page, per_page: limit };
      const s = overrides.search !== undefined ? overrides.search : searchDosen;
      const st = overrides.status !== undefined ? overrides.status : statusDosen;
      const f = overrides.fakultas !== undefined ? overrides.fakultas : fakultasDosen;
      const p = overrides.prodi !== undefined ? overrides.prodi : prodiDosen;

      if (s) params.search = s;
      if (st) params.status_aktif = st === "AKTIF" ? "true" : "false";
      if (f) params.fakultas = f;
      if (p) params.prodi = p;
      return params;
    },
    [searchDosen, statusDosen, fakultasDosen, prodiDosen, itemsPerPageDosen],
  );

  const isInitialMount = useRef(true);

  // Fetch awal per tab
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchMahasiswa(buildMhsParams(1));
      fetchDosen(buildDosenParams(1));
      return;
    }

    if (isMahasiswa) {
      fetchMahasiswa(buildMhsParams(paginationMhs.current_page || 1));
    } else {
      fetchDosen(buildDosenParams(paginationDosen.current_page || 1));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers Mahasiswa ─────────────────────────────────────────

  const handleSearchMhsChange = (e) => {
    const value = e.target.value;
    setSearchMhs(value);
    debouncedFetchMahasiswa(buildMhsParams(1, itemsPerPageMhs, { search: value }));
  };

  const handleStatusMhsChange = (e) => {
    const value = e.target.value;
    setStatusMhs(value);
    fetchMahasiswa(buildMhsParams(1, itemsPerPageMhs, { status: value }));
  };

  const handleTahunMhsChange = (e) => {
    const value = e.target.value;
    setTahunMhs(value);
    fetchMahasiswa(buildMhsParams(1, itemsPerPageMhs, { tahun: value }));
  };

  const handleFakultasMhsChange = (e) => {
    const value = e.target.value;
    setFakultasMhs(value);
    setProdiMhs("");
    fetchMahasiswa(buildMhsParams(1, itemsPerPageMhs, { fakultas: value, prodi: "" }));
  };

  const handleProdiMhsChange = (e) => {
    const value = e.target.value;
    setProdiMhs(value);
    fetchMahasiswa(buildMhsParams(1, itemsPerPageMhs, { prodi: value }));
  };

  const handleMhsPageChange = (page) => {
    fetchMahasiswa(buildMhsParams(page));
  };

  const handleMhsPerPageChange = (newPerPage) => {
    setItemsPerPageMhs(newPerPage);
    fetchMahasiswa(buildMhsParams(1, newPerPage));
  };

  // ─── Handlers Dosen ─────────────────────────────────────────────

  const handleSearchDosenChange = (e) => {
    const value = e.target.value;
    setSearchDosen(value);
    debouncedFetchDosen(buildDosenParams(1, itemsPerPageDosen, { search: value }));
  };

  const handleStatusDosenChange = (e) => {
    const value = e.target.value;
    setStatusDosen(value);
    fetchDosen(buildDosenParams(1, itemsPerPageDosen, { status: value }));
  };

  const handleFakultasDosenChange = (e) => {
    const value = e.target.value;
    setFakultasDosen(value);
    setProdiDosen("");
    fetchDosen(buildDosenParams(1, itemsPerPageDosen, { fakultas: value, prodi: "" }));
  };

  const handleProdiDosenChange = (e) => {
    const value = e.target.value;
    setProdiDosen(value);
    fetchDosen(buildDosenParams(1, itemsPerPageDosen, { prodi: value }));
  };

  const handleDosenPageChange = (page) => {
    fetchDosen(buildDosenParams(page));
  };

  const handleDosenPerPageChange = (newPerPage) => {
    setItemsPerPageDosen(newPerPage);
    fetchDosen(buildDosenParams(1, newPerPage));
  };

  // ─── CRUD Handlers ────────────────────────────────────────────

  const handleTambahSuccess = async (values) => {
    await tambahMahasiswa(values);
    setShowTambah(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await penggunaService.deleteMahasiswa(deleteTarget.id_user);
      setMahasiswa((prev) =>
        prev.filter((m) => m.id_user !== deleteTarget.id_user),
      );
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus data.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditMahasiswaSuccess = async (id, values) => {
    await updateMahasiswa(id, values);
    setEditMahasiswaTarget(null);
  };

  const handleEditDosenSuccess = async (id, values) => {
    try {
      await updateDosen(id, values);
      setEditDosenTarget(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (row) => {
    if (isMahasiswa) setEditMahasiswaTarget(row);
    else setEditDosenTarget(row);
  };

  const handleDeleteDosenConfirm = async () => {
    if (!deleteDosenTarget) return;
    setDeleteDosenLoading(true);
    try {
      await deleteDosen(deleteDosenTarget.id_user);
      setDeleteDosenTarget(null);
    } catch {
      alert("Gagal menghapus data dosen.");
    } finally {
      setDeleteDosenLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let dataToExport = [];
      let filename = "";
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(isMahasiswa ? "Data Mahasiswa" : "Data Dosen");
      
      if (isMahasiswa) {
        const response = await penggunaService.getMahasiswa({ 
          ...buildMhsParams(1, 10000) 
        });
        
        dataToExport = response.data.map((m, index) => ({
          no: index + 1,
          nama_lengkap: val(m.nama_lengkap),
          npm: val(m.nomor_induk),
          email: val(m.email),
          fakultas: formatFakultas(val(m.fakultas)),
          prodi: val(m.prodi),
          tahun_angkatan: val(m.angkatan),
          status: m.status_aktif ? "Aktif" : "Nonaktif"
        }));
        
        filename = `Data_Mahasiswa_${new Date().toISOString().split("T")[0]}.xlsx`;

        worksheet.columns = [
          { header: "No", key: "no", width: 5 },
          { header: "Nama Lengkap", key: "nama_lengkap", width: 30 },
          { header: "NPM", key: "npm", width: 20 },
          { header: "Email", key: "email", width: 30 },
          { header: "Fakultas", key: "fakultas", width: 25 },
          { header: "Program Studi", key: "prodi", width: 25 },
          { header: "Tahun Angkatan", key: "tahun_angkatan", width: 15 },
          { header: "Status", key: "status", width: 15 }
        ];

      } else {
        const response = await penggunaService.getDosen({ 
          ...buildDosenParams(1, 10000) 
        });
        
        dataToExport = response.data.map((d, index) => ({
          no: index + 1,
          nama_lengkap: val(d.nama_lengkap),
          nidn: val(d.nomor_induk),
          email: val(d.email),
          fakultas: formatFakultas(val(d.fakultas)),
          prodi: val(d.prodi),
          tahun_bergabung: d.created_at ? new Date(d.created_at).getFullYear().toString() : "-",
          status: d.status_aktif ? "Aktif" : "Nonaktif"
        }));
        
        filename = `Data_Dosen_${new Date().toISOString().split("T")[0]}.xlsx`;

        worksheet.columns = [
          { header: "No", key: "no", width: 5 },
          { header: "Nama Lengkap", key: "nama_lengkap", width: 30 },
          { header: "NIDN", key: "nidn", width: 20 },
          { header: "Email", key: "email", width: 30 },
          { header: "Fakultas", key: "fakultas", width: 25 },
          { header: "Program Studi", key: "prodi", width: 25 },
          { header: "Tahun Bergabung", key: "tahun_bergabung", width: 15 },
          { header: "Status", key: "status", width: 15 }
        ];
      }

      if (dataToExport.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        setIsExporting(false);
        return;
      }

      // Add Data
      worksheet.addRows(dataToExport);

      // Style Headers
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF167A61" } // Green background
        };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" } // White text
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
      headerRow.height = 25;

      // Style Data Rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.alignment = { vertical: "middle", horizontal: "left" };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
              right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
            };
          });
          // Center align the No column
          row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      // Generate Excel File and Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, filename);
      
    } catch (error) {
      console.error("Gagal mengekspor data:", error);
      alert("Terjadi kesalahan saat mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Modal Tambah Mahasiswa */}
      <TambahMahasiswaModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />

      {/* Modal Ubah Mahasiswa */}
      <UbahMahasiswaModal
        isOpen={!!editMahasiswaTarget}
        data={editMahasiswaTarget}
        onClose={() => setEditMahasiswaTarget(null)}
        onSuccess={handleEditMahasiswaSuccess}
      />

      {/* Modal Ubah Dosen */}
      <UbahDosenModal
        isOpen={!!editDosenTarget}
        data={editDosenTarget}
        onClose={() => setEditDosenTarget(null)}
        onSuccess={handleEditDosenSuccess}
      />

      {/* Modal Hapus Mahasiswa */}
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Data Mahasiswa"
        fields={[
          { label: "Nama", key: "nama_lengkap" },
          { label: "NPM", key: "nomor_induk" },
          { label: "Prodi", key: "prodi" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Modal Hapus Dosen */}
      <DeleteConfirmModal
        data={deleteDosenTarget}
        title="Hapus Data Dosen"
        fields={[
          { label: "Nama", key: "nama_lengkap" },
          { label: "NIDN", key: "nomor_induk" },
          { label: "Prodi", key: "prodi" },
        ]}
        onConfirm={handleDeleteDosenConfirm}
        onCancel={() => setDeleteDosenTarget(null)}
        loading={deleteDosenLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Pengguna
          </h3>
          <div className="flex gap-2.5">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`flex items-center gap-1.5 text-sm font-bold border px-4 py-2 rounded-lg transition-all
                ${isExporting 
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                  : "text-[#167A61] border-[#167A61] hover:bg-[#167A61] hover:text-white"
                }`}
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? "Mengekspor..." : "Eksport Data"}
            </button>
            {isMahasiswa && (
              <button
                onClick={() => setShowTambah(true)}
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
              >
                <Plus size={14} />
                Tambah Mahasiswa
              </button>
            )}
          </div>
        </div>

        <div className="px-7 pb-5">
          <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                  activeTab === key
                    ? "bg-white text-[#167A61] shadow-sm"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <Icon size={15} />
                {label}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === key
                      ? "bg-[#DCFCE7] text-[#008B5E]"
                      : "bg-[#E2E8F0] text-[#94A3B8]"
                  }`}
                >
                  {key === "mahasiswa"
                    ? (loadingMhs && paginationMhs.total === 0 ? "..." : paginationMhs.total)
                    : (loadingDosen && paginationDosen.total === 0 ? "..." : paginationDosen.total)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isMahasiswa ? (
          <UserTable
            data={mahasiswa}
            identifierLabel="NPM"
            identifierKey="nomor_induk"
            tahunLabel="Tahun Angkatan"
            loading={loading}
            error={error}
            emptyMessage="Belum ada data mahasiswa."
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            pagination={paginationMhs}
            onPageChange={handleMhsPageChange}
            onPerPageChange={handleMhsPerPageChange}
            onSearchChange={handleSearchMhsChange}
            onStatusChange={handleStatusMhsChange}
            onTahunChange={handleTahunMhsChange}
            onFakultasChange={handleFakultasMhsChange}
            onProdiChange={handleProdiMhsChange}
            search={searchMhs}
            statusFilter={statusMhs}
            tahunFilter={tahunMhs}
            fakultasFilter={fakultasMhs}
            prodiFilter={prodiMhs}
          />
        ) : (
          <UserTable
            data={dosen}
            identifierLabel="NIDN"
            identifierKey="nomor_induk"
            tahunLabel="Tahun Bergabung"
            loading={loading}
            error={error}
            emptyMessage="Belum ada data dosen aktif."
            onEdit={handleEdit}
            onDelete={setDeleteDosenTarget}
            pagination={paginationDosen}
            onPageChange={handleDosenPageChange}
            onPerPageChange={handleDosenPerPageChange}
            onSearchChange={handleSearchDosenChange}
            onStatusChange={handleStatusDosenChange}
            onTahunChange={() => {}}
            onFakultasChange={handleFakultasDosenChange}
            onProdiChange={handleProdiDosenChange}
            search={searchDosen}
            statusFilter={statusDosen}
            tahunFilter=""
            fakultasFilter={fakultasDosen}
            prodiFilter={prodiDosen}
          />
        )}
      </div>
    </>
  );
}
