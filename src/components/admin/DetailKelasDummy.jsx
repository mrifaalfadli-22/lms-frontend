import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, ChevronRight, ArrowLeft } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import Pagination from "../../components/common/Pagination";

export default function DetailKelasDummy({ title, backTo }) {
  const { id } = useParams();
  const [jadwal, setJadwal] = useState(null);
  const [search, setSearch] = useState("");
  const [angkatanFilter, setAngkatanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    jadwalService.getById(id).then((res) => {
      setJadwal(res);
    }).catch(err => {
      console.error("Gagal memuat jadwal", err);
    });
  }, [id]);

  const DUMMY_CLASSES = [
    {
      id: 1,
      nama: "Kelas A",
      mahasiswa: 45,
      dosen: jadwal?.nama_dosen || "Dr. Fauzi Hamdan",
      nidn: jadwal?.nidn || "12345678877",
      angkatan: 2023,
    },
    {
      id: 2,
      nama: "Kelas B",
      mahasiswa: 40,
      dosen: jadwal?.nama_dosen || "Dr. Fauzi Hamdan",
      nidn: jadwal?.nidn || "12345678877",
      angkatan: 2023,
    },
    {
      id: 3,
      nama: "Kelas C",
      mahasiswa: 35,
      dosen: "Ir. Haryanto, M.T.",
      nidn: "87654321000",
      angkatan: 2022,
    },
  ];

  const ANGKATAN_OPTIONS = [...new Set(DUMMY_CLASSES.map((c) => c.angkatan))].sort((a, b) => b - a);

  const filtered = DUMMY_CLASSES.filter(
    (c) =>
      (c.nama.toLowerCase().includes(search.toLowerCase()) ||
        c.dosen.toLowerCase().includes(search.toLowerCase())) &&
      (!angkatanFilter || String(c.angkatan) === String(angkatanFilter))
  );

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
              placeholder="Cari berdasarkan Kelas, Dosen"
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
          <select
            value={angkatanFilter}
            onChange={(e) => setAngkatanFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Angkatan</option>
            {ANGKATAN_OPTIONS.map((a) => (
              <option key={a} value={String(a)}>
                Angkatan {a}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="px-7 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => {
              const isForum = window.location.pathname.includes("forum-diskusi");
              const isMateri = window.location.pathname.includes("kelola-materi-perkuliahan");
              const isClickable = isForum || isMateri;
              const linkTo = isForum
                ? `/admin/forum-diskusi/${id}/kelas/${c.id}`
                : `/admin/kelola-materi-perkuliahan/${id}/kelas/${c.id}`;
              const CardWrapper = isClickable ? Link : "div";
              const wrapperProps = isClickable ? { to: linkTo } : {};

              return (
                <CardWrapper
                  key={c.id}
                  {...wrapperProps}
                  className="relative block border border-[#E2E8F0] rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-white group overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-transparent group-hover:bg-[#167A61] transition-colors" />

                  <h4 className="text-[16px] font-bold text-[#1E293B] mb-3">
                    {c.nama}
                  </h4>

                  <div className="space-y-1.5">
                    <p className="text-[13px] text-[#64748B]">
                      {c.mahasiswa} Mahasiswa
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Dosen: {c.dosen}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      NIDN: {c.nidn}
                    </p>
                    <p className="text-[13px] text-[#64748B]">
                      Tahun Angkatan: {c.angkatan}
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
