import StatCard from "../../layouts/auth/StatCard";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState, useCallback } from "react";
import { verifikasiService } from "../../services/verifikasiService";
import VerifikasiConfirmModal from "../../components/admin/VerifikasiConfirmModal";
import { useDashboardStats } from "../../hooks/useDashboardStats";

// ── Helpers ───────────────────────────────────────────────────────────────────
const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};



// ── Komponen Utama ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const {
    stats,
    setStats,
    dosenList,
    setDosenList,
    forumList,
    statsLoading,
    dosenLoading,
    dosenError,
    globalError,
    fetchDashboard,
  } = useDashboardStats();

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // ── Proses verifikasi dosen ───────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      await verifikasiService.prosesVerifikasi(
        confirmTarget.data.id_user,
        confirmTarget.aksi,
      );
      setDosenList((prev) =>
        prev.map((d) =>
          d.id_user === confirmTarget.data.id_user
            ? { ...d, status_persetujuan: confirmTarget.aksi }
            : d,
        ),
      );
      if (confirmTarget.aksi === "Disetujui") {
        setStats((prev) => ({
          ...prev,
          dosen: typeof prev.dosen === "number" ? prev.dosen + 1 : prev.dosen,
        }));
      }
      setConfirmTarget(null);
    } catch {
      alert(
        `Gagal ${confirmTarget.aksi === "Disetujui" ? "menyetujui" : "menolak"} dosen.`,
      );
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmTarget, setDosenList, setStats]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <VerifikasiConfirmModal
        data={confirmTarget?.data}
        aksi={confirmTarget?.aksi}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
        loading={confirmLoading}
      />

      <div className="space-y-9">
        {/* Error global */}
        {globalError && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-[13px] text-red-600 font-semibold">
              {globalError}
            </p>
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-1.5 text-[13px] font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              <RefreshCw size={14} />
              Coba Lagi
            </button>
          </div>
        )}

        {/* 1. Row Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <StatCard
            title="Total Mahasiswa"
            value={statsLoading ? "..." : stats.mahasiswa}
          />
          <StatCard
            title="Dosen Aktif"
            value={dosenLoading ? "..." : stats.dosen}
          />
          <StatCard
            title="Kelas Aktif"
            value={statsLoading ? "..." : stats.kelas}
          />
          <StatCard
            title="Mata Kuliah"
            value={statsLoading ? "..." : stats.mataKuliah}
          />
          <StatCard title="Sertifikat Terbit" value={statsLoading ? "..." : stats.sertifikat} />
        </div>

        {/* 2. Card Verifikasi Dosen */}
        <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
          <div className="flex justify-between items-center px-7 pb-4">
            <h3 className="text-[17px] font-extrabold text-[#1E293B]">
              Pengajuan Verifikasi Dosen Terbaru
            </h3>
            <Link
              to="/admin/verifikasi-dosen"
              className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-1.5 rounded-lg hover:bg-[#167A61] hover:text-white transition-all"
            >
              Lihat Semua
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="px-7 overflow-x-auto">
            {dosenLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[13px]">Memuat data dosen...</span>
              </div>
            ) : dosenError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[14px] font-bold text-red-500">
                  {dosenError}
                </p>
                <button
                  onClick={fetchDashboard}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all"
                >
                  <RefreshCw size={13} />
                  Coba Lagi
                </button>
              </div>
            ) : dosenList.length === 0 ? (
              <div className="flex justify-center py-16">
                <p className="text-[14px] text-[#94A3B8]">
                  Belum ada pengajuan dosen.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {[
                      "No",
                      "Nama",
                      "NIDN",
                      "Email",
                      "Fakultas",
                      "Program Studi",
                      "Tanggal Pengajuan",
                      "Status",
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
                  {dosenList.map((d, i) => {
                    return (
                      <tr
                        key={d.id_user}
                        className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                      >
                        <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                          {i + 1}
                        </td>
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setConfirmTarget({
                                  data: d,
                                  aksi: "Disetujui",
                                })
                              }
                              disabled={confirmLoading}
                              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[13px] font-bold transition-all
                                ${d.status_persetujuan === "Disetujui"
                                  ? "bg-[#167A61] text-white border-[#167A61]"
                                  : "text-[#167A61] border-[#167A61]/20 hover:bg-[#167A61] hover:text-white"
                                }`}
                            >
                              <CheckCircle size={14} />
                              <span>Disetujui</span>
                            </button>
                            <button
                              onClick={() =>
                                setConfirmTarget({ data: d, aksi: "Ditolak" })
                              }
                              disabled={confirmLoading}
                              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[13px] font-bold transition-all
                                ${d.status_persetujuan === "Ditolak"
                                  ? "bg-red-600 text-white border-red-600"
                                  : "text-red-600 border-red-100 hover:bg-red-50 hover:border-red-600"
                                }`}
                            >
                              <XCircle size={14} />
                              <span>Ditolak</span>
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
        </div>

        {/* 3. Card Aktivitas Forum */}
        <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
          <div className="flex justify-between items-center px-7 pb-4">
            <h3 className="text-[17px] font-extrabold text-[#1E293B]">
              Aktivitas Forum Diskusi Terbaru
            </h3>
          </div>

          <div className="px-7 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "No",
                    "Pengguna",
                    "NPM/NIDN",
                    "Role",
                    "Matakuliah",
                    "Kelas",
                    "Pertemuan",
                    "Topik",
                    "Waktu",
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
                {forumList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-16 text-center text-[14px] text-[#94A3B8]">
                      Belum ada aktivitas forum.
                    </td>
                  </tr>
                ) : (
                  forumList.map((f, i) => (
                    <tr
                      key={f.id_pesan}
                      className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {i + 1}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {f.pengirim?.nama_lengkap || "-"}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {f.pengirim?.nomor_induk || "-"}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {f.pengirim?.role || "-"}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {f.sesi?.jadwal_perkuliahan?.mata_kuliah?.nama_mk || "-"}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                        {f.sesi?.jadwal_perkuliahan?.kelas?.nama_kelas || "-"}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {f.sesi?.judul_sesi || "Sesi " + f.sesi?.urutan_sesi}
                      </td>
                      <td
                        className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] max-w-[200px]"
                        title={f.isi_pesan}
                      >
                        <span className="block truncate">{f.isi_pesan}</span>
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {f.created_at ? new Date(f.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : "-"}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/admin/forum/${f.id_pesan}`}
                          title="Lihat Detail"
                          className="p-1.5 text-[#64748B] hover:text-[#167A61] transition-colors rounded-lg hover:bg-[#167A61]/10 inline-flex items-center"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
