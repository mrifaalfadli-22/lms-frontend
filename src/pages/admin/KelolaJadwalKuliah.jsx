// src/pages/admin/DaftarJadwalKuliah.jsx
import { useState } from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useJadwalKuliah } from "../../hooks/useJadwalKuliah";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import TambahJadwalModal from "../../components/admin/TambahJadwalModal";
import UbahJadwalModal from "../../components/admin/UbahJadwalModal";
import DetailJadwalModal from "../../components/admin/DetailJadwalModal";
import { TAHUN_AJARAN_OPTIONS } from "../../schemas/jadwalSchema";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

const HARI_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function DaftarJadwalKuliah() {
  const { jadwal, loading, error, tambah, update, hapus } = useJadwalKuliah();

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [hariFilter, setHariFilter] = useState("");

  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const tahunFromData = [
    ...new Set(jadwal.map((j) => j.tahun).filter((t) => t && t !== "-")),
  ].sort((a, b) => b.localeCompare(a));
  const tahunOptions =
    tahunFromData.length > 0
      ? tahunFromData
      : TAHUN_AJARAN_OPTIONS.map((o) => o.value);

  const filtered = jadwal.filter((j) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      [j.nama_mk, j.kelas, j.nama_dosen, j.nidn, j.fakultas, j.prodi].some(
        (v) => v?.toLowerCase().includes(q),
      );
    const matchSemester =
      !semesterFilter || String(j.semester) === semesterFilter;
    const matchTahun = !tahunFilter || j.tahun === tahunFilter;
    const matchHari =
      !hariFilter || j.hari?.toLowerCase() === hariFilter.toLowerCase();
    return matchQ && matchSemester && matchTahun && matchHari;
  });

  const handleTambahSuccess = async (values) => {
    try {
      await tambah(values);
      setShowTambah(false);
    } catch (err) {
      throw err;
    }
  };

  const handleEditSuccess = async (id, values) => {
    try {
      await update(id, values);
      setEditTarget(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await hapus(deleteTarget.id_jadwal);
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus data.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <TambahJadwalModal
        isOpen={showTambah}
        onClose={() => setShowTambah(false)}
        onSuccess={handleTambahSuccess}
      />
      <UbahJadwalModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleEditSuccess}
      />
      <DetailJadwalModal
        isOpen={!!detailTarget}
        data={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Jadwal Kuliah"
        fields={[
          { label: "Mata Kuliah", key: "nama_mk" },
          { label: "Kelas", key: "kelas" },
          { label: "Dosen", key: "nama_dosen" },
          { label: "Hari", key: "hari" },
        ]}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Daftar Jadwal Kuliah
          </h3>
          <div className="flex gap-2.5">
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all">
              <Download size={14} />
              Eksport Data
            </button>
            <button
              onClick={() => setShowTambah(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all"
            >
              <Plus size={14} />
              Tambah Jadwal
            </button>
          </div>
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
              placeholder="Cari mata kuliah, dosen, kelas..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
            />
          </div>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Semester</option>
            {SEMESTER_OPTIONS.map((s) => (
              <option key={s} value={String(s)}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={tahunFilter}
            onChange={(e) => setTahunFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Tahun Ajaran</option>
            {tahunOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={hariFilter}
            onChange={(e) => setHariFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Hari</option>
            {HARI_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="px-7 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[13px]">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[14px] font-bold text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[13px] text-[#167A61] font-semibold hover:underline"
              >
                Muat ulang halaman
              </button>
            </div>
          ) : jadwal.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <CalendarDays size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                Belum ada data jadwal kuliah.
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                Data akan muncul setelah ditambahkan ke sistem.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {[
                    "Mata Kuliah",
                    "Kelas",
                    "Fakultas",
                    "Program Studi",
                    "Dosen",
                    "Hari",
                    "Waktu",
                    "Semester",
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-[#94A3B8] text-[13px]"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((j, i) => (
                    <tr
                      key={j.id_jadwal || i}
                      className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                    >
                      <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                        {val(j.nama_mk)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {val(j.kelas)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-[13px]">
                        {val(j.fakultas)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-[13px]">
                        {val(j.prodi)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {val(j.nama_dosen)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {j.hari ? (
                          <span className="bg-[#FFF7ED] text-[#C2410C] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                            {j.hari}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-[13px]">
                        {j.waktu_mulai && j.waktu_berakhir
                          ? `${j.waktu_mulai.substring(0, 5)} - ${j.waktu_berakhir.substring(0, 5)}`
                          : "-"}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {j.semester !== null && j.semester !== undefined ? (
                          <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black">
                            Semester {j.semester}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDetailTarget(j)}
                            className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                          >
                            <Eye size={14} />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => setEditTarget(j)}
                            className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                          >
                            <Edit2 size={14} />
                            <span>Ubah</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(j)}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold"
                          >
                            <Trash2 size={14} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
