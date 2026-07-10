import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Edit2, Eye, Loader2, Copy, Check } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import UbahSesiModal from "../../components/dosen/UbahSesiModal";
import { useSesiPertemuan } from "../../hooks/useSesiPertemuan";
import api from "../../config/api";

export default function DetailSesiKelas() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const jadwal = location.state?.groupData || null;
  const classData = location.state?.classData || null;

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editTarget, setEditTarget] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isBebasAkses, setIsBebasAkses] = useState(classData?.akses_bebas === true || classData?.akses_bebas === 1);
  const [isTogglingAkses, setIsTogglingAkses] = useState(false);

  const handleToggleAkses = async () => {
    try {
      setIsTogglingAkses(true);
      const res = await api.put(`/jadwal-perkuliahan/${classData?.id_jadwal}/akses-bebas`, {
        akses_bebas: !isBebasAkses
      });
      if (res.data) {
        setIsBebasAkses(!isBebasAkses);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsTogglingAkses(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { sesiList, loading, error, fetchByJadwal, refresh } = useSesiPertemuan();

  useEffect(() => {
    if (kelasId) {
      fetchByJadwal(kelasId);
    }
  }, [kelasId, fetchByJadwal]);

  // Local pagination since fetchByJadwal returns all 16 items
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedSesi = sesiList.slice(startIndex, endIndex);

  return (
    <>
      <UbahSesiModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSaveSuccess={() => {
          setEditTarget(null);
          fetchByJadwal(kelasId);
        }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}`}
          state={{ groupData: jadwal }}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px] mr-2"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Daftar Kelas</span>
        </Link>

        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}`}
          state={{ groupData: jadwal }}
          className="hover:text-[#167A61] transition-colors"
        >
          {jadwal?.nama_mk || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{classData?.nama_kelas || "Memuat..."}</span>
      </div>

      {/* Info Jadwal Perkuliahan Header Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-6 border-t-4 border-t-[#167A61]">
        <h3 className="text-[17px] font-extrabold text-[#1E293B] mb-5">
          Informasi Jadwal Perkuliahan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Mata Kuliah</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              [{jadwal?.kode_mk || "-"}] - {jadwal?.nama_mk || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Kelas</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              [{classData?.kode_kelas || "-"}] - {classData?.nama_kelas || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Hari</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">{classData?.hari || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Waktu</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">
              {classData?.waktu_mulai ? classData.waktu_mulai.substring(0, 5) : "-"} - {classData?.waktu_berakhir ? classData.waktu_berakhir.substring(0, 5) : "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">SKS</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">{jadwal?.sks || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Tahun Ajaran</span>
            <span className="text-[13px] font-semibold text-[#1E293B]">{jadwal?.tahun || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Token Enrollment</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono font-bold text-[#167A61] bg-[#F0FAF6] px-2 py-1 rounded">
                {classData?.token_enrollment || "-"}
              </span>
              {classData?.token_enrollment && (
                <button
                  onClick={() => handleCopy(classData.token_enrollment)}
                  className="p-1.5 text-gray-500 hover:text-[#167A61] hover:bg-gray-100 rounded-md transition-colors"
                  title="Salin Token"
                >
                  {copied ? <Check size={14} className="text-[#167A61]" /> : <Copy size={14} />}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Mahasiswa</span>
            <span className="text-[13px] font-bold text-[#167A61]">{classData?.total_mahasiswa || 0} Orang</span>
          </div>
          <div className="flex flex-col gap-2 col-span-1 md:col-span-2 lg:col-span-4 mt-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] font-bold text-[#1E293B] block mb-1">Akses Bebas Sesi Pertemuan</span>
                <span className="text-[12px] text-[#64748B]">Jika diaktifkan, mahasiswa dapat mengakses semua sesi tanpa batasan tanggal pelaksanaan.</span>
              </div>
              <button
                onClick={handleToggleAkses}
                disabled={isTogglingAkses}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#167A61] focus:ring-offset-2 ${
                  isBebasAkses ? 'bg-[#167A61]' : 'bg-gray-200'
                } ${isTogglingAkses ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isBebasAkses ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7 px-8">
        <h3 className="text-[17px] font-extrabold text-[#1E293B] mb-6">
          Daftar Sesi Pertemuan - {classData?.nama_kelas || ""} ({jadwal?.nama_mk || ""})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Pertemuan
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Tanggal
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Waktu
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Metode
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Materi
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Status
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#64748B]">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedSesi.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#64748B]">
                    Tidak ada sesi pertemuan.
                  </td>
                </tr>
              ) : (
                paginatedSesi.map((item) => (
                  <tr key={item.id_sesi} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {item.judul_sesi}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {item.tanggal_pelaksanaan ? new Date(item.tanggal_pelaksanaan).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {item.waktu}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {item.metode_pertemuan}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {item.materi}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.status === "SELESAI" ? (
                        <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          Selesai
                        </span>
                      ) : item.status === "BERJALAN" ? (
                        <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          Berjalan
                        </span>
                      ) : (
                        <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                          Terjadwal
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dosen/kelola-sesi-pertemuan/${id}/kelas/${kelasId}/pertemuan/${item.id_sesi}`}
                          state={{ groupData: jadwal, classData: classData, pertemuanName: item.judul_sesi, pertemuanData: item }}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Eye size={14} />
                          <span>Lihat</span>
                        </Link>
                        <button
                          onClick={() => setEditTarget(item)}
                          className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            lastPage={Math.max(1, Math.ceil(sesiList.length / perPage))}
            total={sesiList.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </>
  );
}
