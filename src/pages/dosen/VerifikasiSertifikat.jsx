import { useState, useMemo, useEffect } from "react";
import { Search, Layout, CheckCircle, Eye, Edit2, Loader2 } from "lucide-react";
import api from "../../config/api";
import Pagination from "../../components/common/Pagination";
import VerifikasiSertifikatModal from "../../components/dosen/VerifikasiSertifikatModal";
import { formatFakultas } from "../../utils/formatters";

export default function VerifikasiSertifikat() {
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSertifikat, setSelectedSertifikat] = useState(null);
  const [modalMode, setModalMode] = useState("verifikasi"); // 'verifikasi', 'ubah', 'detail'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchVerifikasi = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dosen/verifikasi-sertifikat');
      if (res.data.success) {
        setSertifikatList(res.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat daftar verifikasi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifikasi();
  }, []);

  // Open modal handler
  const openModal = (item, mode) => {
    setSelectedSertifikat(item);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  // Status verify update handler
  const handleVerify = async (id, newStatus) => {
    try {
      const res = await api.put(`/dosen/verifikasi-sertifikat/${id}`, {
        status_kelayakan: newStatus === "MENUNGGU" ? "Belum Ditentukan" : newStatus === "DISETUJUI" ? "Disetujui" : "Ditolak",
      });
      if (res.data.success) {
        setSertifikatList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status kelayakan", error);
    }
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return sertifikatList.filter((item) => {
      const matchSearch =
        !search ||
        (item.nama && item.nama.toLowerCase().includes(search.toLowerCase())) ||
        (item.nim && item.nim.toLowerCase().includes(search.toLowerCase())) ||
        (item.mataKuliah && item.mataKuliah.toLowerCase().includes(search.toLowerCase()));

      const matchFakultas = fakultasFilter ? item.fakultas === fakultasFilter : true;
      const matchProdi = prodiFilter ? item.prodi === prodiFilter : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;

      return matchSearch && matchFakultas && matchProdi && matchStatus;
    });
  }, [sertifikatList, search, fakultasFilter, prodiFilter, statusFilter]);

  // Pagination Logic
  const totalItems = filteredData.length;
  const lastPage = Math.ceil(totalItems / perPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, perPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, fakultasFilter, prodiFilter, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "MENUNGGU":
        return <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">Menunggu</span>;
      case "DITOLAK":
        return <span className="bg-[#FEE2E2] text-[#EF4444] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">Ditolak</span>;
      case "DISETUJUI":
        return <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">Disetujui</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-[12px] font-black uppercase">{status}</span>;
    }
  };

  // Extract unique options for filters
  const uniqueFakultas = useMemo(() => {
    return [...new Set(sertifikatList.map(item => item.fakultas).filter(Boolean))].sort();
  }, [sertifikatList]);

  const uniqueProdi = useMemo(() => {
    // If fakultas is selected, only show prodi for that fakultas
    const listToUse = fakultasFilter 
      ? sertifikatList.filter(item => item.fakultas === fakultasFilter) 
      : sertifikatList;
    return [...new Set(listToUse.map(item => item.prodi).filter(Boolean))].sort();
  }, [sertifikatList, fakultasFilter]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Pengajuan Sertifikat
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
              placeholder="Cari NPM, nama mahasiswa, atau mata kuliah..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all bg-white"
            />
          </div>

          <select
            value={fakultasFilter}
            onChange={(e) => {
              setFakultasFilter(e.target.value);
              setProdiFilter(""); // reset prodi when fakultas changes
            }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Fakultas</option>
            {uniqueFakultas.map(f => (
              <option key={f} value={f}>{formatFakultas(f)}</option>
            ))}
          </select>

          <select
            value={prodiFilter}
            onChange={(e) => setProdiFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Prodi</option>
            {uniqueProdi.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="BELUM DITENTUKAN">Menunggu</option>
            <option value="DISETUJUI">Disetujui</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </div>

        {/* Table / State */}
        <div className="px-7 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={28} className="animate-spin text-[#167A61] mb-4" />
              <p className="text-[14px] font-bold text-[#64748B]">Memuat data...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <Layout size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || fakultasFilter || prodiFilter || statusFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada pengajuan sertifikat."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || fakultasFilter || prodiFilter || statusFilter
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Pengajuan sertifikat mahasiswa akan muncul di sini."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "No",
                    "NPM",
                    "Nama Mahasiswa",
                    "Fakultas",
                    "Prodi",
                    "Mata Kuliah",
                    "Kehadiran",
                    "Nilai Akhir",
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
                {currentData.map((item, i) => {
                  // Handle safe display for kehadiran string
                  const kehadiranParts = item.kehadiran ? item.kehadiran.split("/") : ["0", "0"];
                  const hadir = kehadiranParts[0]?.trim() || "0";
                  const total = kehadiranParts[1]?.trim() || "0";

                  return (
                    <tr
                      key={item.id}
                      className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {(currentPage - 1) * perPage + i + 1}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {item.nim}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {item.nama}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {formatFakultas(item.fakultas)}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {item.prodi}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {item.mataKuliah}
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        <span className="text-[#0E5C46] font-semibold">{hadir}</span>
                        <span className="text-[#94A3B8]"> / {total}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {item.nilaiAkhir}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status === 'BELUM DITENTUKAN' ? 'MENUNGGU' : item.status)}
                      </td>
                      <td className="py-4 px-4">
                        {item.status === "BELUM DITENTUKAN" || item.status === "MENUNGGU" ? (
                          <button
                            onClick={() => openModal(item, "verifikasi")}
                            className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/30 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                          >
                            <CheckCircle size={14} />
                            <span>Verifikasi</span>
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(item, "detail")}
                              className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/30 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                            >
                              <Eye size={14} />
                              <span>Detail</span>
                            </button>
                            <button
                              onClick={() => openModal(item, "ubah")}
                              className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/30 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                            >
                              <Edit2 size={14} />
                              <span>Ubah</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      <VerifikasiSertifikatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSertifikat(null);
        }}
        data={selectedSertifikat}
        mode={modalMode}
        onVerify={handleVerify}
      />
    </>
  );
}
