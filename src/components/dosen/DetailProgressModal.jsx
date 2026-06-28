import { X, Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../config/api";

export default function DetailProgressModal({ isOpen, onClose, data, mataKuliah, kelas, idJadwal }) {
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nilaiData, setNilaiData] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && data && idJadwal) {
      // Clear previous states
      setToast(null);
      fetchData();
    }
  }, [isOpen, data, idJadwal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resTugas = await api.get(`/tugas/jadwal/${idJadwal}`);
      const tugas = resTugas.data.data || [];

      let currentIdMahasiswa = data.id_mahasiswa;

      // Fallback jika user belum refresh halaman setelah update backend (state lama)
      if (!currentIdMahasiswa) {
        const fallbackRes = await api.get(`/dosen/monitoring-progres/${idJadwal}`);
        const list = fallbackRes.data.data || [];
        const found = list.find((m) => m.nim === data.nim);
        if (found && found.id_mahasiswa) {
          currentIdMahasiswa = found.id_mahasiswa;
          data.id_mahasiswa = currentIdMahasiswa; // Mutasi reference object agar save() juga mendapatkannya
        } else {
          throw new Error("ID Mahasiswa tidak ditemukan, silahkan refresh halaman");
        }
      }

      const resNilai = await api.get(`/nilai-cbt/peserta/${currentIdMahasiswa}`);
      const nilai = resNilai.data.data || [];

      const nilaiMap = {};
      nilai.forEach((n) => {
        nilaiMap[n.id_tugas] = n.nilai !== null ? Math.round(Number(n.nilai)) : "";
      });

      setTugasList(tugas);
      setNilaiData(nilaiMap);
    } catch (err) {
      console.error("Gagal memuat detail nilai", err);
      showToast("Gagal memuat detail nilai", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNilaiChange = (id_tugas, value) => {
    setNilaiData((prev) => ({
      ...prev,
      [id_tugas]: value,
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalPayload = [];
      for (const t of tugasList) {
        const n = nilaiData[t.id_tugas];
        if (n !== undefined && n !== null && n !== "") {
          finalPayload.push({
            id_tugas: t.id_tugas,
            id_peserta: data.id_mahasiswa, // Fix: Gunakan UUID Mahasiswa
            nilai: parseFloat(n)
          });
        }
      }

      if (finalPayload.length > 0) {
        await api.post('/nilai-cbt', { nilai: finalPayload });
        showToast("Nilai berhasil disimpan!");
        fetchData();
      } else {
        showToast("Tidak ada nilai yang diinputkan.", "warning");
      }
    } catch (err) {
      console.error("Gagal menyimpan nilai", err);
      showToast("Gagal menyimpan nilai. Periksa koneksi atau input Anda.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Logic for predikat
  const getPredikat = (avg) => {
    if (avg >= 90) return "A";
    if (avg >= 85) return "A-";
    if (avg >= 80) return "B";
    if (avg >= 75) return "B-";
    if (avg >= 70) return "C";
    if (avg >= 65) return "C-";
    return "D";
  };

  const getPredikatColor = (predikat) => {
    if (predikat.startsWith("A")) return "text-[#008B5E]";
    if (predikat.startsWith("B")) return "text-[#3B82F6]";
    if (predikat.startsWith("C")) return "text-[#F59E0B]";
    return "text-red-500";
  };

  let totalScore = 0;
  let countScore = 0;
  tugasList.forEach((t) => {
    const val = nilaiData[t.id_tugas];
    if (val !== undefined && val !== null && val !== "") {
      totalScore += parseFloat(val);
      countScore++;
    }
  });

  const avg = countScore > 0 ? (totalScore / countScore) : 0;
  const predikat = countScore > 0 ? getPredikat(avg) : "-";

  const kehadiranParts = data?.kehadiran ? data.kehadiran.split("/") : ["0", "0"];
  const kehadiranPct = kehadiranParts[1] !== "0" ? Math.round((parseInt(kehadiranParts[0], 10) / parseInt(kehadiranParts[1], 10)) * 100) : 0;

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[700px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className={`flex items-center gap-2.5 px-5 py-3 rounded-full shadow-lg border text-[13px] font-bold ${toast.type === 'success'
                ? 'bg-[#F0FAF6] border-[#008B5E]/20 text-[#008B5E]'
                : toast.type === 'warning'
                  ? 'bg-[#FFFBEB] border-[#F59E0B]/20 text-[#F59E0B]'
                  : 'bg-[#FEF2F2] border-red-500/20 text-red-600'
              }`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <AlertCircle size={16} strokeWidth={2.5} />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-start">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#1E293B] mb-1.5 tracking-tight">
              Detail Nilai - {data.nama}
            </h3>
            <p className="text-[13px] font-medium text-[#64748B]">
              NPM: {data.nim} <span className="mx-1 text-gray-300">|</span> {mataKuliah} - {kelas}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#1E293B] transition-colors bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Cards */}
          <div className="grid grid-cols-2 gap-5 mb-10">
            <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <h4 className={`text-[32px] font-black leading-none mb-2 tracking-tight ${predikat !== '-' ? getPredikatColor(predikat) : 'text-gray-400'}`}>
                {predikat}
              </h4>
              <p className="text-[13px] font-semibold text-[#64748B]">Nilai Predikat</p>
              {predikat !== '-' && (
                <span className="text-[11px] font-bold text-gray-400 mt-1">Rata-rata: {Math.round(avg)}</span>
              )}
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <h4 className="text-[32px] font-black text-[#F59E0B] leading-none mb-2 tracking-tight">
                {kehadiranParts[0]} <span className="text-[22px] text-gray-300 mx-1 font-normal">/</span> {kehadiranParts[1]}
              </h4>
              <p className="text-[13px] font-semibold text-[#64748B]">Kehadiran</p>
              {kehadiranParts[1] !== "0" && (
                <span className="text-[11px] font-bold text-gray-400 mt-1">Persentase: {kehadiranPct}%</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-5">
            <h4 className="text-[15px] font-extrabold text-[#1E293B]">Rincian Tugas & Nilai</h4>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#008B5E] text-white rounded-xl hover:bg-[#00704A] transition-all font-bold text-[13px] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Simpan Perubahan Nilai</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white">
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase w-[10%] text-center">No</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase w-[15%] text-center">Pertemuan</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase w-[35%]">Judul Tugas</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase w-[20%]">Nilai</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase w-[20%]">Status</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-500">
                      <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#167A61]" />
                      <span className="text-[13px] font-medium">Memuat data nilai...</span>
                    </td>
                  </tr>
                ) : tugasList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-500 text-[13px] font-medium">
                      Belum ada tugas di kelas ini.
                    </td>
                  </tr>
                ) : (
                  tugasList.map((row, idx) => {
                    const nilai = nilaiData[row.id_tugas];
                    let statusLabel = "BELUM DINILAI";
                    let type = "warning";

                    if (nilai !== undefined && nilai !== null && nilai !== "") {
                      const numNilai = parseFloat(nilai);
                      if (numNilai >= 70) {
                        statusLabel = "LULUS";
                        type = "success";
                      } else {
                        statusLabel = "TIDAK LULUS";
                        type = "danger";
                      }
                    }

                    return (
                      <tr key={row.id_tugas} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 group">
                        <td className="py-3 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] text-center">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-normal text-[#64748B] group-hover:text-[#0E5C46] text-center whitespace-nowrap">
                          Pertemuan Ke-{row.sesi_pertemuan?.pertemuan_ke || row.sesiPertemuan?.pertemuan_ke || '-'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46]">
                          {row.judul_tugas}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={nilai !== undefined ? nilai : ""}
                            onChange={(e) => handleNilaiChange(row.id_tugas, e.target.value)}
                            className="w-[80px] px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white"
                            placeholder="0-100"
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 rounded-full text-[11px] font-black tracking-wide uppercase ${type === 'success' ? 'bg-[#ECFDF5] text-[#008B5E]' :
                              type === 'danger' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                                'bg-[#FFFBEB] text-[#F59E0B]'
                            }`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
