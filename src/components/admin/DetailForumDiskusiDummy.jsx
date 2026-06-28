import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronRight, ArrowLeft, Trash2, Search, Eye, Loader2 } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import forumDiskusiService from "../../services/forumDiskusiService";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import DetailPesanModal from "../../components/admin/DetailPesanModal";
import Pagination from "../../components/common/Pagination";
import dayjs from "dayjs";
const formatWaktu = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    return `${Math.floor(diffHours)} jam yang lalu`;
  }
  
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function DetailForumDiskusiDummy() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const [jadwal, setJadwal] = useState(location.state?.groupData || null);
  const classDataState = location.state?.classData || null;
  const [classData, setClassData] = useState(classDataState);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [pertemuanFilter, setPertemuanFilter] = useState("");

  const [discussions, setDiscussions] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await forumDiskusiService.getByJadwal(kelasId);
      setDiscussions(res.data || []);
    } catch (err) {
      console.error("Gagal memuat forum diskusi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [kelasId]);

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setIsDeleting(true);
      try {
        await forumDiskusiService.delete(deleteTarget.id_pesan);
        setDiscussions(discussions.filter(d => d.id_pesan !== deleteTarget.id_pesan));
        setDeleteTarget(null);
      } catch (err) {
        console.error("Gagal menghapus pesan", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const namaKelas = classData?.nama_kelas || "Memuat Kelas...";

  const PERTEMUAN_OPTIONS = [...new Set(discussions.map((d) => d.pertemuan))].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  const filtered = discussions.filter((d) => {
    const matchSearch =
      d.nama_pengirim.toLowerCase().includes(search.toLowerCase()) ||
      d.isi_pesan.toLowerCase().includes(search.toLowerCase());
    const matchPertemuan = !pertemuanFilter || d.pertemuan === pertemuanFilter;
    return matchSearch && matchPertemuan;
  });

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const lastPage = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <>
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Komentar/Diskusi"
        fields={[
          { label: "Pertemuan", key: "pertemuan" },
          { label: "Pembuat", key: "nama_pengirim" },
          { label: "Isi Komentar", key: "isi_pesan" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
      />

      <DetailPesanModal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        data={viewTarget ? {
          pertemuan: viewTarget.pertemuan,
          pembuat: viewTarget.nama_pengirim,
          nidn: viewTarget.nim,
          role: viewTarget.role_pengirim,
          waktu: formatWaktu(viewTarget.created_at),
          isi: viewTarget.isi_pesan,
        } : null}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/admin/forum-diskusi/${id}`}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px]"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span>Kembali ke Daftar Kelas</span>
        </Link>
        <Link
          to={`/admin/forum-diskusi/${id}`}
          className="hover:text-[#167A61] transition-colors font-semibold"
        >
          {jadwal?.nama_mk || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B]">{namaKelas}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-3 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Forum Diskusi & Komentar
          </h3>
        </div>

        {/* Toolbar: Search + Filter Pertemuan */}
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
              placeholder="Cari pembuat atau isi diskusi..."
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
        <div className="px-7 pt-4 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-[#94A3B8]">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-[14px] font-bold">Memuat data forum diskusi...</span>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["No", "Pertemuan", "Pembuat", "Role", "Isi Diskusi / Komentar", "Waktu Kirim", "Aksi"].map((h) => (
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
                {paginated.map((d, index) => {
                  const waktuStr = formatWaktu(d.created_at);
                  const isNew = dayjs().diff(dayjs(d.created_at), 'hour') < 24;

                  return (
                    <tr
                      key={d.id_pesan}
                      className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        <span className="bg-[#F1F5F9] px-3 py-1 rounded-lg text-[13px]">
                          {d.pertemuan}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {d.nama_pengirim}
                      </td>
                      <td className="py-4 px-4 text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap capitalize">
                        {d.role_pengirim}
                      </td>
                      <td className="py-4 px-4 min-w-[250px] max-w-[300px]">
                        <div className="bg-[#F8FAFC] border border-[#F1F5F9] p-3 rounded-lg text-[#64748B] text-[13px]" title={d.isi_pesan}>
                          <p className="line-clamp-2 m-0 leading-relaxed">
                            {d.isi_pesan}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isNew ? (
                          <span className="bg-[#DCFCE7] text-[#167A61] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide">
                            {waktuStr}
                          </span>
                        ) : (
                          <span className="text-[#167A61] text-[12px] font-bold uppercase tracking-wide">
                            {waktuStr}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewTarget(d)}
                            className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                          >
                            <Eye size={14} />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(d)}
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
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[14px] font-bold text-[#64748B]">
                      Tidak ada diskusi atau komentar.
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
