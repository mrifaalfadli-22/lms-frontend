import { useState, useEffect } from "react";
import {
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  MessageSquare,
  BarChart3,
  BookOpen,
  Search,
} from "lucide-react";
import evaluasiService from "../../services/evaluasiService";
import { useProfile } from "../../hooks/useProfile";
import { formatFakultas } from "../../utils/formatters";

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${rating >= star
              ? "fill-yellow-400 text-yellow-400"
              : rating >= star - 0.5
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-gray-100 text-gray-200"
            }`}
        />
      ))}
      <span className="ml-1 text-[13px] font-bold text-gray-700">
        {rating > 0 ? rating.toFixed(2) : "0.00"}
      </span>
    </div>
  );
}

function DetailKelas({ jadwal }) {
  const [isOpen, setIsOpen] = useState(false);

  // Group pertanyaan berdasarkan kategori
  const grouped = {};
  jadwal.detail_pertanyaan?.forEach((p) => {
    if (!grouped[p.kategori]) grouped[p.kategori] = [];
    grouped[p.kategori].push(p);
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
      {/* Header Card */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen size={22} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-bold tracking-wide">
                Semester {jadwal.semester}
              </span>
              {jadwal.fakultas && (
                <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[11px] font-bold">
                  {formatFakultas(jadwal.fakultas)}
                </span>
              )}
              {jadwal.prodi && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[11px] font-bold">
                  {jadwal.prodi}
                </span>
              )}
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[11px] font-bold">
                Kelas {jadwal.kelas}
              </span>
            </div>
            <h3 className="text-[16px] font-bold text-[#1E293B]">
              {jadwal.mata_kuliah}
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
                <BarChart3 size={14} className="text-gray-400" />
                Rata-rata: <RatingStars rating={jadwal.rata_rata_keseluruhan} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-4">Belum ada data evaluasi untuk kelas ini.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.keys(grouped).map((kategori) => (
                <div key={kategori} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                    <h4 className="text-[14px] font-bold text-[#1E293B]">{kategori}</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {grouped[kategori].map((p, idx) => (
                      <div key={idx} className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-[13px] text-[#1E293B] leading-relaxed flex-1">
                            <span className="font-semibold mr-1.5">{idx + 1}.</span>
                            {p.teks_pertanyaan}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            <Users size={12} />
                            {p.total_responden}
                          </div>
                        </div>

                        <div className="pl-5 border-l-2 border-gray-100 ml-1.5">
                          {p.tipe_pertanyaan === "skala" ? (
                            <div className="flex items-center gap-2">
                              <RatingStars rating={p.rata_rata} />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 mt-2">
                              {(!p.jawaban_teks || p.jawaban_teks.length === 0) ? (
                                <p className="text-[12px] text-gray-400 italic">Belum ada jawaban essay.</p>
                              ) : (
                                p.jawaban_teks.map((teks, i) => (
                                  <div key={i} className="flex gap-2 items-start bg-purple-50/50 p-3 rounded-lg border border-purple-100/50">
                                    <MessageSquare size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[13px] text-gray-700 leading-relaxed italic">
                                      &quot;{teks}&quot;
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HasilEvaluasi() {
  const { user } = useProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for filter & sort
  const [search, setSearch] = useState("");
  const [filterFakultas, setFilterFakultas] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "terendah" | "tertinggi" | ""

  useEffect(() => {
    if (user?.id_user) {
      fetchHasil();
    }
  }, [user]);

  const fetchHasil = async () => {
    try {
      setLoading(true);
      const res = await evaluasiService.getHasilByDosen(user.id_user);
      setData(res || []);
    } catch (err) {
      console.error("Gagal memuat hasil evaluasi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique filter options
  const listFakultas = [...new Set(data.map((d) => d.fakultas).filter(Boolean))];
  const listProdi = [...new Set(data.map((d) => d.prodi).filter(Boolean))];

  // Apply filters and sort
  const processedData = data
    .filter((d) => {
      const matchSearch =
        d.mata_kuliah.toLowerCase().includes(search.toLowerCase()) ||
        d.kelas.toLowerCase().includes(search.toLowerCase());
      const matchFakultas = !filterFakultas || d.fakultas === filterFakultas;
      const matchProdi = !filterProdi || d.prodi === filterProdi;
      return matchSearch && matchFakultas && matchProdi;
    })
    .sort((a, b) => {
      if (sortOrder === "terendah") {
        return a.rata_rata_keseluruhan - b.rata_rata_keseluruhan;
      } else if (sortOrder === "tertinggi") {
        return b.rata_rata_keseluruhan - a.rata_rata_keseluruhan;
      }
      return 0;
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#167A61]/10 rounded-xl flex items-center justify-center text-[#167A61]">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-[19px] font-extrabold text-[#1E293B]">Hasil Evaluasi Mahasiswa</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Pantau rekapitulasi penilaian anonim dari mahasiswa untuk mata kuliah yang Anda ajar.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar (Search, Filter, Sort) */}
      <div className="flex flex-wrap gap-3 px-1">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mata kuliah atau kelas..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all bg-white"
          />
        </div>
        <select
          value={filterFakultas}
          onChange={(e) => setFilterFakultas(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white min-w-[150px] cursor-pointer"
        >
          <option value="">Semua Fakultas</option>
          {listFakultas.map((f) => (
            <option key={f} value={f}>
              {formatFakultas(f)}
            </option>
          ))}
        </select>
        <select
          value={filterProdi}
          onChange={(e) => setFilterProdi(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white min-w-[150px] cursor-pointer"
        >
          <option value="">Semua Prodi</option>
          {listProdi.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white min-w-[150px] cursor-pointer"
        >
          <option value="">Urutkan Default</option>
          <option value="tertinggi">Skor Tertinggi</option>
          <option value="terendah">Skor Terendah</option>
        </select>
      </div>

      {/* Content */}
      <div className="px-1">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 size={28} className="animate-spin text-[#167A61]" />
            <p className="text-[13px] text-gray-400">Memuat hasil evaluasi...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
              <ClipboardList size={28} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-gray-500">Belum ada hasil evaluasi</p>
              <p className="text-[13px] text-gray-400 mt-1 max-w-sm">
                Saat ini Anda belum memiliki jadwal kelas, atau belum ada evaluasi yang dilakukan oleh mahasiswa untuk kelas Anda.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {processedData.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[13px] text-gray-400">Tidak ada data yang sesuai dengan filter/pencarian Anda.</p>
              </div>
            ) : (
              processedData.map((jadwal) => (
                <DetailKelas key={jadwal.id_jadwal} jadwal={jadwal} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
