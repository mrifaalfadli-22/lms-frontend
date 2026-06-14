import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ChevronRight, ArrowLeft, Trash2, Search } from "lucide-react";
import jadwalService from "../../services/jadwalService";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import Pagination from "../../components/common/Pagination";

export default function DetailForumDiskusiDummy() {
  const { id, kelasId } = useParams();
  const [jadwal, setJadwal] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [pertemuanFilter, setPertemuanFilter] = useState("");
  
  // Dummy state for discussions
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      pertemuan: "Pertemuan 1",
      pembuat: "Dimas Putra Pratama",
      nidn: "1234567890",
      role: "Mahasiswa",
      judul: "Pertanyaan tentang Integral",
      isi: "Apakah ada cara cepat untuk menyelesaikan integral substitusi yang kompleks?",
      waktu: "POSTINGAN BARU",
      isNew: true
    },
    {
      id: 2,
      pertemuan: "Pertemuan 1",
      pembuat: "Anwar Abdul",
      nidn: "0987654321",
      role: "Dosen",
      judul: "Pertanyaan tentang Integral",
      isi: "Apakah ada cara cepat untuk menyelesaikan integral substitusi yang kompleks?",
      waktu: "2 MENIT LALU",
      isNew: false
    },
    {
      id: 3,
      pertemuan: "Pertemuan 2",
      pembuat: "Dimas Putra Pratama",
      nidn: "1234567890",
      role: "Mahasiswa",
      judul: "Pertanyaan tentang Integral",
      isi: "Apakah ada cara cepat untuk menyelesaikan integral substitusi yang kompleks?",
      waktu: "10 MENIT LALU",
      isNew: false
    },
    {
      id: 4,
      pertemuan: "Pertemuan 2",
      pembuat: "Anwar Abdul",
      nidn: "0987654321",
      role: "Dosen",
      judul: "Pertanyaan tentang Integral",
      isi: "Apakah ada cara cepat untuk menyelesaikan integral substitusi yang kompleks?",
      waktu: "POSTINGAN BARU",
      isNew: true
    }
  ]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    jadwalService.getById(id).then((res) => {
      setJadwal(res);
    }).catch(err => {
      console.error("Gagal memuat jadwal", err);
    });
  }, [id]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setDiscussions(discussions.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const namaKelas = kelasId === "1" ? "Kelas A" : kelasId === "2" ? "Kelas B" : "Kelas C";
  const PERTEMUAN_OPTIONS = [...new Set(discussions.map((d) => d.pertemuan))];

  const filtered = discussions.filter((d) => {
    const matchSearch =
      d.pembuat.toLowerCase().includes(search.toLowerCase()) ||
      d.judul.toLowerCase().includes(search.toLowerCase()) ||
      d.isi.toLowerCase().includes(search.toLowerCase());
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
          { label: "Pembuat", key: "pembuat" },
          { label: "Isi Komentar", key: "isi" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={false}
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
        <ChevronRight size={14} />
        <span className="text-[#1E293B]">{jadwal?.nama_mk || "Memuat..."}</span>
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
              placeholder="Cari pembuat, judul, atau isi diskusi..."
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
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {["No", "Pertemuan", "Pembuat", "NIDN/NPM", "Role", "Isi Diskusi / Komentar", "Waktu Kirim Pesan", "Aksi"].map((h) => (
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
              {paginated.map((d, index) => (
                <tr
                  key={d.id}
                  className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-4 px-4 text-[#64748B] font-bold whitespace-nowrap">
                    {(currentPage - 1) * perPage + index + 1}
                  </td>
                  <td className="py-4 px-4 font-bold text-[#167A61] whitespace-nowrap">
                    {d.pertemuan}
                  </td>
                  <td className="py-4 px-4 text-[#1E293B] whitespace-nowrap">
                    {d.pembuat}
                  </td>
                  <td className="py-4 px-4 text-[#64748B] whitespace-nowrap">
                    {d.nidn}
                  </td>
                  <td className="py-4 px-4 text-[#64748B] whitespace-nowrap">
                    {d.role}
                  </td>
                  <td className="py-4 px-4 min-w-[300px]">
                    <div className="mb-2">
                      <span className="font-bold text-[#1E293B] text-[13px]">{d.judul}</span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] p-3 rounded-lg text-[#64748B] text-[13px]">
                      {d.isi}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {d.isNew ? (
                      <span className="bg-[#DCFCE7] text-[#167A61] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide">
                        {d.waktu}
                      </span>
                    ) : (
                      <span className="text-[#167A61] text-[12px] font-bold uppercase tracking-wide">
                        {d.waktu}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[14px] font-bold text-[#64748B]">
                    Tidak ada diskusi atau komentar.
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
