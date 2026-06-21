import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronRight, ArrowLeft, Trash2, Eye, Download, Search, X, FileText } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import materiService from "../../services/materiService";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import Pagination from "../../components/common/Pagination";

export default function DetailMateriDummy() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const [jadwal, setJadwal] = useState(location.state?.groupData || null);
  const classDataState = location.state?.classData || null;
  const [classData, setClassData] = useState(classDataState);

  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch materi from API
  useEffect(() => {
    const fetchMateri = async () => {
      setLoading(true);
      try {
        const data = await materiService.getByJadwal(kelasId);
        setMateri(data);
      } catch (err) {
        console.error("Gagal memuat materi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMateri();
  }, [kelasId]);

  const namaKelas = classData?.nama_kelas || "Memuat Kelas...";

  const PERTEMUAN_OPTIONS = [...new Set(materi.map((m) => m.pertemuan))].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  const filtered = materi.filter((m) => {
    const matchSearch =
      (m.judul || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.pertemuan || "").toLowerCase().includes(search.toLowerCase());
    const matchPertemuan = !pertemuanFilter || m.pertemuan === pertemuanFilter;
    return matchSearch && matchPertemuan;
  });

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      try {
        await materiService.delete(deleteTarget.id);
        setMateri((prev) => prev.filter((m) => m.id !== deleteTarget.id));
        setDeleteTarget(null);
      } catch (err) {
        console.error("Gagal menghapus materi:", err);
      }
    }
  };

  const handleDownloadFile = async (filePath) => {
    try {
      const cleanName = filePath.split('/').pop().replace(/^[a-f0-9-]+_/, '');
      await materiService.forceDownload(filePath, cleanName);
    } catch (err) {
      console.error("Gagal download file:", err);
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

            {viewTarget.deskripsi && (
              <div className="mb-4">
                <p className="text-[12px] font-bold text-[#167A61] mb-1">Deskripsi</p>
                <p className="text-[14px] text-[#64748B]">{viewTarget.deskripsi}</p>
              </div>
            )}

            {/* File list */}
            <div className="mb-5 space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {viewTarget.file_materi && viewTarget.file_materi.length > 0 ? (
                viewTarget.file_materi.map((filePath, i) => {
                  const fileName = filePath.split('/').pop().replace(/^[a-f0-9-]+_/, '');
                  return (
                    <div key={i} className="border border-[#E2E8F0] rounded-xl p-3 flex flex-row items-center justify-between gap-3 hover:border-[#167A61] hover:shadow-sm transition-all">
                      <div className="flex flex-row items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#F1F5F9] rounded-lg">
                          <FileText size={20} className="text-[#94A3B8]" strokeWidth={1.5} />
                        </div>
                        <p className="text-[13px] font-semibold text-[#1E293B] truncate" title={fileName}>
                          {fileName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(filePath)}
                        className="flex-shrink-0 px-3 py-1.5 text-[12px] font-bold text-[#167A61] bg-[#F0FAF6] hover:bg-[#167A61] hover:text-white rounded-lg transition-colors"
                      >
                        Unduh
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="border border-[#E2E8F0] rounded-xl p-5 flex flex-col items-center justify-center gap-2">
                  <p className="text-[13px] text-[#94A3B8]">Tidak ada file yang diunggah</p>
                </div>
              )}
            </div>

            {viewTarget.link_video && (
              <div className="mb-4">
                <p className="text-[12px] font-bold text-[#167A61] mb-1">Link Video Pembelajaran</p>
                <a href={viewTarget.link_video} target="_blank" rel="noopener noreferrer" className="text-[14px] text-blue-600 hover:underline break-all">
                  {viewTarget.link_video}
                </a>
              </div>
            )}

            {viewTarget.file_materi && viewTarget.file_materi.length > 0 && (
              <button
                onClick={() => {
                  viewTarget.file_materi.forEach(filePath => handleDownloadFile(filePath));
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#167A61] hover:bg-[#0E5C46] text-white py-3 rounded-xl text-[14px] font-bold transition-all"
              >
                <Download size={16} />
                Unduh Semua Materi
              </button>
            )}
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
          {loading ? (
            <div className="text-center py-12 text-[14px] font-bold text-[#64748B]">
              Memuat data materi...
            </div>
          ) : (
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
          )}
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
