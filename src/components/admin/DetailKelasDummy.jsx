import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Search, ChevronRight, ArrowLeft } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import Pagination from "../../components/common/Pagination";

export default function DetailKelasDummy({ title, backTo }) {
  const { id } = useParams();
  const location = useLocation();
  const [jadwal, setJadwal] = useState(location.state?.groupData || null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (!jadwal) {
      jadwalService.getGroupedByJadwalId(id).then((res) => {
        setJadwal(res);
      }).catch(err => {
        console.error("Gagal memuat data jadwal terkelompok", err);
      });
    }
  }, [id, jadwal]);

  const kelasList = jadwal?.kelas_list || [];

  const filtered = kelasList.filter(
    (c) =>
      c.nama_kelas?.toLowerCase().includes(search.toLowerCase()) ||
      c.kode_kelas?.toLowerCase().includes(search.toLowerCase()) ||
      c.hari?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper untuk format waktu
  const formatWaktu = (mulai, akhir) => {
    if (!mulai || !akhir) return "-";
    return `${mulai.substring(0, 5)} - ${akhir.substring(0, 5)}`;
  };

  return (
    <>
      {/* Breadcrumb - outside card */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={backTo}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Mata Kuliah</span>
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{jadwal?.nama_mk || "Memuat..."}</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="px-7 pb-5">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Kelas - {jadwal?.nama_mk || "..."}
          </h3>
        </div>

        {/* Toolbar */}
        <div className="px-7 pb-5 flex gap-3 flex-wrap items-center">
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
              placeholder="Cari berdasarkan Nama Kelas, Kode, atau Hari"
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="px-7 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => {
              const isForum = window.location.pathname.includes("forum-diskusi");
              const isMateri = window.location.pathname.includes("kelola-materi-perkuliahan");
              const isDosenSesi = window.location.pathname.includes("dosen/kelola-sesi-pertemuan");
              const isMonitoring = window.location.pathname.includes("dosen/monitoring-progres");
              const isClickable = isForum || isMateri || isDosenSesi || isMonitoring;
              const linkTo = isForum
                ? `/admin/forum-diskusi/${id}/kelas/${c.id_jadwal}`
                : isMateri 
                ? `/admin/kelola-materi-perkuliahan/${id}/kelas/${c.id_jadwal}`
                : isDosenSesi
                ? `/dosen/kelola-sesi-pertemuan/${id}/kelas/${c.id_jadwal}`
                : `/dosen/monitoring-progres/${id}/kelas/${c.id_jadwal}`;
              const CardWrapper = isClickable ? Link : "div";
              const wrapperProps = isClickable ? { to: linkTo, state: { classData: c, groupData: jadwal } } : {};

              return (
                <CardWrapper
                  key={c.id_jadwal}
                  {...wrapperProps}
                  className="relative block border border-[#E2E8F0] rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-white group overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-transparent group-hover:bg-[#167A61] transition-colors" />

                  <h4 className="text-[16px] font-bold text-[#1E293B] mb-3">
                    {c.nama_kelas || "-"}
                  </h4>

                  <div className="space-y-1.5">
                    <p className="text-[13px] text-[#64748B]">
                      Kode Kelas: {c.kode_kelas || "-"}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Jadwal: {c.hari || "-"}, {formatWaktu(c.waktu_mulai, c.waktu_berakhir)}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Dosen: {jadwal?.nama_dosen || "-"}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      NIDN: {jadwal?.nidn || "-"}
                    </p>
                    <p className="text-[13px] text-[#167A61] font-bold pt-1">
                      Total Mahasiswa: {c.total_mahasiswa || 0} Orang
                    </p>
                  </div>
                </CardWrapper>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[14px] text-[#64748B] font-bold">
              Data kelas tidak ditemukan.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={1}
            total={filtered.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>
    </>
  );
}
