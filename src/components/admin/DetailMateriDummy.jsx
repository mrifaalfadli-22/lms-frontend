import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronRight, ArrowLeft, Trash2, Eye, Download, Search, X, FileText } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import Pagination from "../../components/common/Pagination";

const DUMMY_MATERI = [
  { id: 1, pertemuan: "Pertemuan ke-1", judul: "Pengenalan dan Kontrak Kuliah", jumlah_file: 2, tanggal: "01 Maret 2026" },
  { id: 2, pertemuan: "Pertemuan ke-2", judul: "Konsep Dasar dan Teori Awal", jumlah_file: 1, tanggal: "08 Maret 2026" },
  { id: 3, pertemuan: "Pertemuan ke-3", judul: "Video Penjelasan Praktik", jumlah_file: 2, tanggal: "15 Maret 2026" },
  { id: 4, pertemuan: "Pertemuan ke-4", judul: "Latihan Soal dan Pembahasan", jumlah_file: 3, tanggal: "22 Maret 2026" },
  { id: 5, pertemuan: "Pertemuan ke-5", judul: "Studi Kasus dan Analisis", jumlah_file: 1, tanggal: "29 Maret 2026" },
  { id: 6, pertemuan: "Pertemuan ke-6", judul: "Review Materi Tengah Semester", jumlah_file: 2, tanggal: "05 April 2026" },
  { id: 7, pertemuan: "Pertemuan ke-7", judul: "Presentasi Kelompok", jumlah_file: 4, tanggal: "12 April 2026" },
];

export default function DetailMateriDummy() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const [jadwal, setJadwal] = useState(location.state?.groupData || null);
  const classDataState = location.state?.classData || null;
  const [classData, setClassData] = useState(classDataState);
  
  const [materi, setMateri] = useState(DUMMY_MATERI);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [pertemuanFilter, setPertemuanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (!jadwal) {
      jadwalService.getGroupedByJadwalId(id).then((res) => {
        setJadwal(res);
        if (res && res.kelas_list) {
          const foundClass = res.kelas_list.find(k => k.id_jadwal === kelasId);
          if (foundClass) setClassData(foundClass);
        }
      }).catch(err => {
        console.error("Gagal memuat jadwal", err);
      });
    } else if (!classData && jadwal.kelas_list) {
      const foundClass = jadwal.kelas_list.find(k => k.id_jadwal === kelasId);
      if (foundClass) setClassData(foundClass);
    }
  }, [id, kelasId, jadwal, classData]);

  const namaKelas = classData?.nama_kelas || "Memuat Kelas...";

  const PERTEMUAN_OPTIONS = [...new Set(DUMMY_MATERI.map((m) => m.pertemuan))];

  const filtered = materi.filter((m) => {
    const matchSearch =
      m.judul.toLowerCase().includes(search.toLowerCase()) ||
      m.pertemuan.toLowerCase().includes(search.toLowerCase());
    const matchPertemuan = !pertemuanFilter || m.pertemuan === pertemuanFilter;
    return matchSearch && matchPertemuan;
  });

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setMateri((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Materi"
        fields={[
          { label: "Pertemuan", key: "pertemuan" },
          { label: "Judul Materi", key: "judul" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={false}
      />

      {/* Modal Lihat Materi */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-7 relative animate-fadeIn">
            {/* Close */}
            <button
              onClick={() => setViewTarget(null)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-[18px] font-extrabold text-[#1E293B] mb-5">Detail Materi</h2>

            <div className="mb-4">
              <p className="text-[12px] font-bold text-[#167A61] mb-1">Judul Materi</p>
              <p className="text-[14px] text-[#1E293B] font-semibold">{viewTarget.judul}</p>
            </div>

            {/* File list dummy */}
            <div className="mb-5 space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: viewTarget.jumlah_file }).map((_, i) => (
                <div key={i} className="border border-[#E2E8F0] rounded-xl p-5 flex flex-col items-center justify-center gap-2">
                  <div className="w-14 h-14 flex items-center justify-center">
                    <FileText size={48} className="text-[#94A3B8]" strokeWidth={1.2} />
                  </div>
                  <p className="text-[13px] font-semibold text-[#1E293B]">
                    materi_pertemuan_{viewTarget.id}_file{i + 1}.pdf
                  </p>
                  <p className="text-[12px] text-[#94A3B8]">{(Math.random() * 3 + 0.5).toFixed(1)} MB</p>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-[#167A61] hover:bg-[#0E5C46] text-white py-3 rounded-xl text-[14px] font-bold transition-all">
              <Download size={16} />
              Unduh Materi
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/admin/kelola-materi-perkuliahan/${id}`}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px]"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Daftar Kelas</span>
        </Link>
        <Link
          to={`/admin/kelola-materi-perkuliahan/${id}`}
          className="hover:text-[#167A61] transition-colors font-semibold"
        >
          {jadwal?.nama_mk || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{namaKelas}</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-3 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Materi - {namaKelas}
          </h3>
          <button className="flex items-center gap-2 bg-[#167A61] hover:bg-[#0E5C46] text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-all">
            <Download size={14} />
            <span>Eksport Data</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 px-7 pt-2 pb-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              size={15}
              strokeWidth={2.5}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari judul materi atau pertemuan..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
          <select
            value={pertemuanFilter}
            onChange={(e) => { setPertemuanFilter(e.target.value); setCurrentPage(1); }}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Pertemuan</option>
            {PERTEMUAN_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="px-7 pt-2 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {["No", "Pertemuan", "Judul Materi", "Jumlah File", "Tanggal Diunggah", "Aksi"].map((h) => (
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
              {paginated.map((m, index) => (
                <tr
                  key={m.id}
                  className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    <span className="bg-[#F1F5F9] px-3 py-1 rounded-lg text-[13px]">
                      {m.pertemuan}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                    {m.judul}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] text-[13px] font-bold group-hover:bg-[#0E5C46]/10 group-hover:text-[#0E5C46] transition-colors">
                      {m.jumlah_file}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {m.tanggal}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewTarget(m)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                      >
                        <Eye size={14} />
                        <span>Lihat</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[14px] font-bold text-[#64748B]">
                    Data materi tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={filtered.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={(val) => { setPerPage(val); setCurrentPage(1); }}
          />
        )}
      </div>
    </>
  );
}
