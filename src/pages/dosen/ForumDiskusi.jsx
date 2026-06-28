import { useState, useMemo, useEffect } from "react";
import { Search, ExternalLink, MessageSquare, Eye, Layout, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import forumDiskusiService from "../../services/forumDiskusiService";
import { useProfile } from "../../hooks/useProfile";

// Helper function untuk relative time
const timeAgo = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Baru saja";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} minggu yang lalu`;
  
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ForumDiskusiMahasiswa() {
  const navigate = useNavigate();
  const { user } = useProfile();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = Semua, "Belum Dibaca", "Sudah Dibaca"
  
  const [forumData, setForumData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const res = await forumDiskusiService.getAllForDosen({ per_page: 500 });
      setForumData(res.data);
    } catch (err) {
      console.error("Gagal memuat data forum:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumData();
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    return forumData.filter((item) => {
      const matchSearch =
        (item.nama_pengirim && item.nama_pengirim.toLowerCase().includes(search.toLowerCase())) ||
        (item.nim && item.nim.toLowerCase().includes(search.toLowerCase())) ||
        (item.role_pengirim && item.role_pengirim.toLowerCase().includes(search.toLowerCase())) ||
        (item.isi_pesan && item.isi_pesan.toLowerCase().includes(search.toLowerCase())) ||
        (item.matakuliah && item.matakuliah.toLowerCase().includes(search.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === "Belum Dibaca") {
        matchStatus = item.id_pengirim !== user?.id_user && !item.is_read;
      } else if (statusFilter === "Sudah Dibaca") {
        matchStatus = item.id_pengirim === user?.id_user || item.is_read;
      }

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, forumData]);

  // Pagination Logic
  const totalItems = filteredData.length;
  const lastPage = Math.ceil(totalItems / perPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, perPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Forum Diskusi Mahasiswa
          </h3>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NPM, mata kuliah, atau isi pesan..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Belum Dibaca">Belum Dibaca</option>
            <option value="Sudah Dibaca">Sudah Dibaca</option>
          </select>
        </div>

        {/* Table / State */}
        <div className="px-7 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
              <p className="text-[14px] font-bold text-[#64748B]">Memuat Data...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <Layout size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || statusFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada diskusi."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || statusFilter
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Diskusi akan muncul setelah mahasiswa bertanya."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "No",
                    "Pengguna",
                    "NPM",
                    "Mata kuliah",
                    "Kelas",
                    "Pertemuan",
                    "Isi Pesan",
                    "Status",
                    "Waktu",
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
                {currentData.map((f, i) => (
                  <tr
                    key={f.id_pesan}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      if (f.id_jadwal && f.id_kelas && f.id_sesi) {
                        navigate(`/dosen/kelola-sesi-pertemuan/${f.id_jadwal}/kelas/${f.id_kelas}/pertemuan/${f.id_sesi}`, {
                          state: { 
                            activeTab: 'forum',
                            groupData: { nama_mk: f.matakuliah },
                            classData: { nama_kelas: f.kelas },
                            pertemuanName: f.pertemuan,
                            pertemuanData: f.sesi_data ? {
                              ...f.sesi_data,
                              metode: f.sesi_data.metode_pertemuan === 'synchronous' ? 'Synchronous' : 'Asynchronous',
                            } : undefined
                          }
                        });
                      }
                    }}
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.nama_pengirim}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {f.role_pengirim === 'Mahasiswa' ? f.nim : f.role_pengirim}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.matakuliah}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {f.kelas}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.pertemuan}
                    </td>
                    <td
                      className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] max-w-[250px]"
                      title={f.isi_pesan}
                    >
                      <span className="block truncate">{f.isi_pesan}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {f.id_pengirim === user?.id_user ? (
                        <span className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#F1F5F9] text-[#64748B]">
                          -
                        </span>
                      ) : f.is_read ? (
                        <span className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#F1F5F9] text-[#64748B]">
                          SUDAH DIBACA
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#EAF5F0] text-[#167A61]">
                          PESAN BARU
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {timeAgo(f.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        title="Lihat Pesan"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (f.id_jadwal && f.id_kelas && f.id_sesi) {
                            navigate(`/dosen/kelola-sesi-pertemuan/${f.id_jadwal}/kelas/${f.id_kelas}/pertemuan/${f.id_sesi}`, {
                              state: { 
                                activeTab: 'forum',
                                groupData: { nama_mk: f.matakuliah },
                                classData: { nama_kelas: f.kelas },
                                pertemuanName: f.pertemuan,
                                pertemuanData: f.sesi_data ? {
                                  ...f.sesi_data,
                                  metode: f.sesi_data.metode_pertemuan === 'synchronous' ? 'Synchronous' : 'Asynchronous',
                                } : undefined
                              }
                            });
                          }
                        }}
                        className="p-1.5 text-[#64748B] hover:text-[#167A61] transition-colors rounded-lg hover:bg-[#167A61]/10"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {currentData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>
    </>
  );
}
