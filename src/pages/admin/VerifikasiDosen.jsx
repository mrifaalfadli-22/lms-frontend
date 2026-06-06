import { useState, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Users,
  Loader2,
} from "lucide-react";
import { useVerifikasi } from "../../hooks/useVerifikasi";
import VerifikasiConfirmModal from "../../components/admin/VerifikasiConfirmModal";
import Pagination from "../../components/common/Pagination";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function StatusBadge({ status }) {
  if (status === "Disetujui")
    return (
      <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
        Disetujui
      </span>
    );
  if (status === "Ditolak")
    return (
      <span className="bg-[#FEF2F2] text-[#991B1B] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
        Ditolak
      </span>
    );
  return (
    <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
      Menunggu
    </span>
  );
}

function EmptyState({ hasFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
        <Users size={28} className="text-[#94A3B8]" />
      </div>
      <p className="text-[14px] font-bold text-[#64748B]">
        {hasFilter ? "Data tidak ditemukan." : "Belum ada pengajuan dosen."}
      </p>
      <p className="text-[13px] text-[#94A3B8] mt-1">
        {hasFilter
          ? "Coba ubah kata kunci atau filter pencarian."
          : "Data akan muncul saat dosen melakukan registrasi."}
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

export default function VerifikasiDosen() {
  const { dosen, loading, error, pagination, fetchDosen, debouncedFetch, prosesVerifikasi } =
    useVerifikasi();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const buildParams = useCallback(
    (page = 1) => {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      return params;
    },
    [search, statusFilter],
  );

  // Fetch awal
  useEffect(() => {
    fetchDosen(buildParams(1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = { page: 1 };
    if (value) params.search = value;
    if (statusFilter) params.status = statusFilter;
    debouncedFetch(params);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    const params = { page: 1 };
    if (search) params.search = search;
    if (value) params.status = value;
    fetchDosen(params);
  };

  const handlePageChange = (page) => {
    fetchDosen(buildParams(page));
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await prosesVerifikasi(confirmTarget.data.id_user, confirmTarget.aksi);
      setConfirmTarget(null);
    } catch {
      alert(
        `Gagal ${confirmTarget.aksi === "Disetujui" ? "menyetujui" : "menolak"} dosen.`,
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <VerifikasiConfirmModal
        data={confirmTarget?.data}
        aksi={confirmTarget?.aksi}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
        loading={confirmLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Pengajuan Dosen
          </h3>
          <div className="flex gap-2">
            <span className="bg-[#F1F5F9] text-[#64748B] text-[12px] font-black px-3 py-1.5 rounded-full">
              {pagination.total} Total
            </span>
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
              placeholder="Cari nama, NIDN, atau email..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : dosen.length === 0 ? (
          <EmptyState hasFilter={!!(search || statusFilter)} />
        ) : (
          <div className="px-7 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "Nama",
                    "NIDN",
                    "Email",
                    "Fakultas",
                    "Program Studi",
                    "Tanggal Pengajuan",
                    "Status",
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
                {dosen.map((d) => {
                  const sudahDiproses = d.status_persetujuan !== "Menunggu";
                  return (
                    <tr
                      key={d.id_user}
                      className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 group"
                    >
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {val(d.nama_lengkap)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {val(d.nomor_induk)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {val(d.email)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {val(d.fakultas)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {val(d.prodi)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {formatTanggal(d.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={d.status_persetujuan} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setConfirmTarget({ data: d, aksi: "Disetujui" })
                            }
                            disabled={sudahDiproses || confirmLoading}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[13px] font-bold transition-all
                              ${
                                sudahDiproses || confirmLoading
                                  ? "text-[#CBD5E1] border-[#E2E8F0] bg-[#F8FAFC] cursor-not-allowed"
                                  : "text-[#167A61] border-[#167A61]/20 hover:bg-[#167A61] hover:text-white cursor-pointer"
                              }`}
                          >
                            <CheckCircle size={14} />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() =>
                              setConfirmTarget({ data: d, aksi: "Ditolak" })
                            }
                            disabled={sudahDiproses || confirmLoading}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[13px] font-bold transition-all
                              ${
                                sudahDiproses || confirmLoading
                                  ? "text-[#CBD5E1] border-[#E2E8F0] bg-[#F8FAFC] cursor-not-allowed"
                                  : "text-red-600 border-red-100 hover:bg-red-50 cursor-pointer"
                              }`}
                          >
                            <XCircle size={14} />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && dosen.length > 0 && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}
