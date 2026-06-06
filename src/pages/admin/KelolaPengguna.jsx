import { useState, useEffect, useCallback } from "react";
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
  onSearchChange,
  onStatusChange,
  onTahunChange,
  search,
  statusFilter,
  tahunFilter,
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
      </div>

      <div className="px-7 overflow-x-auto">
        {data.length === 0 ? (
          <EmptyState
            message={
              search || statusFilter || tahunFilter
                ? "Data tidak ditemukan."
                : emptyMessage
            }
            hasFilter={!!(search || statusFilter || tahunFilter)}
          />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {[
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
                      {val(r.nama_lengkap)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r[identifierKey])}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r.email)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {val(r.fakultas)}
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

  const [searchDosen, setSearchDosen] = useState("");
  const [statusDosen, setStatusDosen] = useState("");

  const [showTambah, setShowTambah] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDosenTarget, setDeleteDosenTarget] = useState(null);
  const [deleteDosenLoading, setDeleteDosenLoading] = useState(false);

  const [editMahasiswaTarget, setEditMahasiswaTarget] = useState(null);
  const [editDosenTarget, setEditDosenTarget] = useState(null);

  const isMahasiswa = activeTab === "mahasiswa";

  // Build params helpers
  const buildMhsParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (searchMhs) params.search = searchMhs;
      if (statusMhs)
        params.status_aktif = statusMhs === "AKTIF" ? "true" : "false";
      if (tahunMhs) params.angkatan = tahunMhs;
      return params;
    },
    [searchMhs, statusMhs, tahunMhs],
  );

  const buildDosenParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (searchDosen) params.search = searchDosen;
      if (statusDosen) {
        // Untuk dosen, kita filter berdasarkan status_aktif juga
        // tapi getDosen sudah default status=Disetujui
      }
      return params;
    },
    [searchDosen, statusDosen],
  );

  // Fetch awal per tab
  useEffect(() => {
    if (isMahasiswa) {
      fetchMahasiswa(buildMhsParams(1));
    } else {
      fetchDosen(buildDosenParams(1));
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers Mahasiswa ─────────────────────────────────────────

  const handleSearchMhsChange = (e) => {
    const value = e.target.value;
    setSearchMhs(value);
    const params = { page: 1 };
    if (value) params.search = value;
    if (statusMhs)
      params.status_aktif = statusMhs === "AKTIF" ? "true" : "false";
    if (tahunMhs) params.angkatan = tahunMhs;
    debouncedFetchMahasiswa(params);
  };

  const handleStatusMhsChange = (e) => {
    const value = e.target.value;
    setStatusMhs(value);
    const params = { page: 1 };
    if (searchMhs) params.search = searchMhs;
    if (value) params.status_aktif = value === "AKTIF" ? "true" : "false";
    if (tahunMhs) params.angkatan = tahunMhs;
    fetchMahasiswa(params);
  };

  const handleTahunMhsChange = (e) => {
    const value = e.target.value;
    setTahunMhs(value);
    const params = { page: 1 };
    if (searchMhs) params.search = searchMhs;
    if (statusMhs)
      params.status_aktif = statusMhs === "AKTIF" ? "true" : "false";
    if (value) params.angkatan = value;
    fetchMahasiswa(params);
  };

  const handleMhsPageChange = (page) => {
    fetchMahasiswa(buildMhsParams(page));
  };

  // ─── Handlers Dosen ─────────────────────────────────────────────

  const handleSearchDosenChange = (e) => {
    const value = e.target.value;
    setSearchDosen(value);
    const params = { page: 1 };
    if (value) params.search = value;
    debouncedFetchDosen(params);
  };

  const handleStatusDosenChange = (e) => {
    const value = e.target.value;
    setStatusDosen(value);
    const params = { page: 1 };
    if (searchDosen) params.search = searchDosen;
    fetchDosen(params);
  };

  const handleDosenPageChange = (page) => {
    fetchDosen(buildDosenParams(page));
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
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all">
              <Download size={14} />
              Eksport Data
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
                    ? paginationMhs.total
                    : paginationDosen.total}
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
            onSearchChange={handleSearchMhsChange}
            onStatusChange={handleStatusMhsChange}
            onTahunChange={handleTahunMhsChange}
            search={searchMhs}
            statusFilter={statusMhs}
            tahunFilter={tahunMhs}
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
            onSearchChange={handleSearchDosenChange}
            onStatusChange={handleStatusDosenChange}
            onTahunChange={() => {}}
            search={searchDosen}
            statusFilter={statusDosen}
            tahunFilter=""
          />
        )}
      </div>
    </>
  );
}
