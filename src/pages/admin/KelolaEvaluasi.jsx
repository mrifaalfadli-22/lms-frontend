import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import evaluasiService from "../../services/evaluasiService";
import TambahPertanyaanEvaluasiModal from "../../components/admin/TambahPertanyaanEvaluasiModal";
import UbahPertanyaanEvaluasiModal from "../../components/admin/UbahPertanyaanEvaluasiModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";

// Peta ikon & warna berdasarkan kategori
const KATEGORI_STYLE = {
  "Kinerja Dosen": {
    icon: GraduationCap,
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    header: "from-blue-600 to-blue-700",
    dot: "bg-blue-500",
  },
  "Kualitas Pembelajaran": {
    icon: BookOpen,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    header: "from-[#167A61] to-[#0E5C46]",
    dot: "bg-emerald-500",
  },
  default: {
    icon: Tag,
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    header: "from-purple-600 to-purple-700",
    dot: "bg-purple-500",
  },
};

function getKategoriStyle(kategori) {
  return KATEGORI_STYLE[kategori] || KATEGORI_STYLE.default;
}

// Komponen baris pertanyaan tunggal
function PertanyaanRow({ pertanyaan, index, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(pertanyaan.id_pertanyaan);
    setToggling(false);
  };

  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors group">
      {/* Urutan & kontrol pindah */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5 min-w-[28px]">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronUp size={13} />
        </button>
        <span className="text-[12px] font-bold text-gray-400 leading-none">
          {pertanyaan.urutan}
        </span>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Nomor urut global */}
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[12px] font-bold text-gray-500">{index + 1}</span>
      </div>

      {/* Teks pertanyaan & Tipe */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className={`text-[14px] leading-relaxed ${pertanyaan.is_aktif ? "text-[#1E293B]" : "text-gray-400 line-through"}`}>
          {pertanyaan.teks_pertanyaan}
        </p>
        <div>
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
            pertanyaan.tipe_pertanyaan === 'teks' 
              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {pertanyaan.tipe_pertanyaan === 'teks' ? 'Teks Bebas' : 'Skala Likert'}
          </span>
        </div>
      </div>

      {/* Status & Aksi */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Toggle aktif */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={pertanyaan.is_aktif ? "Nonaktifkan" : "Aktifkan"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all border ${
            pertanyaan.is_aktif
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
          } disabled:opacity-50`}
        >
          {toggling ? (
            <Loader2 size={12} className="animate-spin" />
          ) : pertanyaan.is_aktif ? (
            <ToggleRight size={14} />
          ) : (
            <ToggleLeft size={14} />
          )}
          {pertanyaan.is_aktif ? "Aktif" : "Nonaktif"}
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(pertanyaan)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all"
          title="Edit pertanyaan"
        >
          <Pencil size={14} />
        </button>

        {/* Hapus */}
        <button
          onClick={() => onDelete(pertanyaan)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
          title="Hapus pertanyaan"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Komponen card per kategori
function KategoriCard({ kategori, pertanyaans, onEdit, onDelete, onToggle, onMoveUp, onMoveDown }) {
  const style = getKategoriStyle(kategori);
  const Icon = style.icon;
  const aktifCount = pertanyaans.filter((p) => p.is_aktif).length;

  return (
    <div className={`rounded-2xl border ${style.border} overflow-hidden shadow-sm`}>
      {/* Header kategori */}
      <div className={`bg-gradient-to-r ${style.header} px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-white">{kategori}</h4>
            <p className="text-[12px] text-white/70 mt-0.5">
              {pertanyaans.length} pertanyaan &bull; {aktifCount} aktif
            </p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-[12px] font-semibold px-3 py-1 rounded-full">
          {aktifCount}/{pertanyaans.length}
        </span>
      </div>

      {/* Daftar pertanyaan */}
      <div className="bg-white divide-y-0">
        {pertanyaans.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-gray-400">
            Belum ada pertanyaan di kategori ini.
          </div>
        ) : (
          pertanyaans.map((p, idx) => (
            <PertanyaanRow
              key={p.id_pertanyaan}
              pertanyaan={p}
              index={idx}
              isFirst={idx === 0}
              isLast={idx === pertanyaans.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onMoveUp={() => onMoveUp(kategori, idx)}
              onMoveDown={() => onMoveDown(kategori, idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function KelolaEvaluasi() {
  const [pertanyaans, setPertanyaans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  // Modal states
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPertanyaans();
  }, []);

  const fetchPertanyaans = async () => {
    try {
      setLoading(true);
      const result = await evaluasiService.getPertanyaans();
      setPertanyaans(result.data);
    } catch (err) {
      console.error("Gagal memuat pertanyaan evaluasi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & group
  const filtered = useMemo(() => {
    return pertanyaans.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.teks_pertanyaan?.toLowerCase().includes(q) ||
        p.kategori?.toLowerCase().includes(q);
      const matchKategori = !filterKategori || p.kategori === filterKategori;
      const matchStatus =
        !filterStatus ||
        (filterStatus === "aktif" ? p.is_aktif : !p.is_aktif);
      return matchSearch && matchKategori && matchStatus;
    });
  }, [pertanyaans, search, filterKategori, filterStatus]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((p) => {
      if (!map[p.kategori]) map[p.kategori] = [];
      map[p.kategori].push(p);
    });
    // Sort per kategori berdasarkan urutan
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => a.urutan - b.urutan);
    });
    // Sort keys: Kinerja Dosen first, Kualitas Pembelajaran second, others alphabetically
    const PRIORITY = ["Kinerja Dosen", "Kualitas Pembelajaran"];
    const sortedKeys = Object.keys(map).sort((a, b) => {
      const ai = PRIORITY.indexOf(a);
      const bi = PRIORITY.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return { map, sortedKeys };
  }, [filtered]);

  const allKategoris = useMemo(
    () => [...new Set(pertanyaans.map((p) => p.kategori))].sort(),
    [pertanyaans]
  );

  const nextUrutan = useMemo(() => {
    if (pertanyaans.length === 0) return 1;
    return Math.max(...pertanyaans.map((p) => p.urutan)) + 1;
  }, [pertanyaans]);

  // Stats
  const totalAktif = pertanyaans.filter((p) => p.is_aktif).length;
  const totalKategori = [...new Set(pertanyaans.map((p) => p.kategori))].length;

  // Handlers
  const handleTambah = async (payload) => {
    await evaluasiService.createPertanyaan(payload);
    await fetchPertanyaans();
  };

  const handleUbah = async (id, payload) => {
    await evaluasiService.updatePertanyaan(id, payload);
    await fetchPertanyaans();
  };

  const handleToggle = async (id) => {
    await evaluasiService.toggleAktifPertanyaan(id);
    await fetchPertanyaans();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await evaluasiService.deletePertanyaan(deleteTarget.id_pertanyaan);
      setDeleteTarget(null);
      await fetchPertanyaans();
    } catch (err) {
      console.error("Gagal menghapus:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pindah urutan dalam kategori yang sama
  const handleMoveUp = async (kategori, idx) => {
    if (idx === 0) return;
    const list = [...grouped.map[kategori]];
    const a = list[idx];
    const b = list[idx - 1];
    const urutanA = a.urutan;
    const urutanB = b.urutan;
    setSavingOrder(true);
    try {
      await evaluasiService.bulkUpdateUrutan([
        { id_pertanyaan: a.id_pertanyaan, urutan: urutanB },
        { id_pertanyaan: b.id_pertanyaan, urutan: urutanA },
      ]);
      await fetchPertanyaans();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleMoveDown = async (kategori, idx) => {
    const list = grouped.map[kategori];
    if (idx === list.length - 1) return;
    const a = list[idx];
    const b = list[idx + 1];
    const urutanA = a.urutan;
    const urutanB = b.urutan;
    setSavingOrder(true);
    try {
      await evaluasiService.bulkUpdateUrutan([
        { id_pertanyaan: a.id_pertanyaan, urutan: urutanB },
        { id_pertanyaan: b.id_pertanyaan, urutan: urutanA },
      ]);
      await fetchPertanyaans();
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <>
      {/* Modals */}
      <TambahPertanyaanEvaluasiModal
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={handleTambah}
        nextUrutan={nextUrutan}
      />
      <UbahPertanyaanEvaluasiModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleUbah}
        data={editTarget}
      />
      <DeleteConfirmModal
        data={deleteTarget}
        title="Hapus Pertanyaan Evaluasi"
        fields={[
          { label: "Kategori", key: "kategori" },
          { label: "Pertanyaan", key: "teks_pertanyaan" },
        ]}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <div className="flex flex-col gap-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-[#167A61]/10 rounded-xl flex items-center justify-center">
              <ClipboardList size={20} className="text-[#167A61]" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-medium">Total Pertanyaan</p>
              <p className="text-[22px] font-extrabold text-[#1E293B] leading-tight">
                {pertanyaans.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ToggleRight size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-medium">Aktif</p>
              <p className="text-[22px] font-extrabold text-emerald-600 leading-tight">
                {totalAktif}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[12px] text-gray-500 font-medium">Total Kategori</p>
              <p className="text-[22px] font-extrabold text-blue-600 leading-tight">
                {totalKategori}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
          {/* Header */}
          <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1E293B]">
                Template Pertanyaan Evaluasi
              </h3>
              <p className="text-[13px] text-gray-400 mt-0.5">
                Pertanyaan yang aktif akan ditampilkan ke mahasiswa setelah pembelajaran selesai.
              </p>
            </div>
            <button
              onClick={() => setIsTambahOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2.5 rounded-xl hover:bg-[#0E5C46] transition-all shadow-sm shadow-[#167A61]/20"
            >
              <Plus size={15} />
              Tambah Pertanyaan
            </button>
          </div>

          {/* Toolbar filter */}
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
                placeholder="Cari pertanyaan atau kategori..."
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {allKategoris.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            {savingOrder && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#167A61] font-medium">
                <Loader2 size={13} className="animate-spin" />
                Menyimpan urutan...
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-7">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-[#167A61]" />
                <p className="text-[13px] text-gray-400">Memuat pertanyaan evaluasi...</p>
              </div>
            ) : grouped.sortedKeys.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <ClipboardList size={28} className="text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-gray-400">Belum ada pertanyaan</p>
                  <p className="text-[13px] text-gray-300 mt-1">
                    Klik &ldquo;Tambah Pertanyaan&rdquo; untuk memulai membuat template evaluasi.
                  </p>
                </div>
                <button
                  onClick={() => setIsTambahOpen(true)}
                  className="flex items-center gap-2 text-sm font-bold text-white bg-[#167A61] px-4 py-2.5 rounded-xl hover:bg-[#0E5C46] transition-all mt-1"
                >
                  <Plus size={15} />
                  Tambah Pertanyaan Pertama
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Info urutan */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-600">i</span>
                  </div>
                  <p className="text-[12px] text-blue-700 leading-relaxed">
                    Mahasiswa akan mengisi evaluasi secara berurutan — mulai dari kategori{" "}
                    <strong>Kinerja Dosen</strong> lalu <strong>Kualitas Pembelajaran</strong>,
                    dalam satu layar tanpa pindah halaman. Gunakan tombol ↑↓ untuk mengatur
                    urutan pertanyaan dalam setiap kategori.
                  </p>
                </div>

                {/* Cards per kategori */}
                {grouped.sortedKeys.map((kategori) => (
                  <KategoriCard
                    key={kategori}
                    kategori={kategori}
                    pertanyaans={grouped.map[kategori]}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onToggle={handleToggle}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
