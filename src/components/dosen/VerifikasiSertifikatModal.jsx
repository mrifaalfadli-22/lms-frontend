import { useState } from "react";
import { Check, X, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifikasiSertifikatModal({ isOpen, onClose, data, mode = "verifikasi", onVerify }) {
  if (!isOpen || !data) return null;

  const [loadingAction, setLoadingAction] = useState(null); // 'setujui' or 'tolak'
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // 'DISETUJUI' or 'DITOLAK'

  // Extract presence details
  const kehadiranTercapai = parseInt(data.kehadiran.split(" / ")[0]) || 0;
  const kehadiranTotal = parseInt(data.kehadiran.split(" / ")[1]) || 16;
  const kehadiranMinimal = Math.ceil(kehadiranTotal * 0.75);
  const isKehadiranMet = kehadiranTercapai >= kehadiranMinimal;

  // Extract grade details
  const nilaiAkhir = parseFloat(data.nilaiAkhir) || 0;
  const isNilaiMet = nilaiAkhir >= 70;

  // Assignments check
  const tugasTercapai = data.tugas ? parseInt(data.tugas.split("/")[0]) : 5;
  const tugasTotal = data.tugas ? parseInt(data.tugas.split("/")[1]) : 5;
  const isTugasMet = tugasTercapai === tugasTotal;

  // Check if all criteria met
  const isAllMet = isKehadiranMet && isNilaiMet && isTugasMet;

  const handleInitiateAction = (status) => {
    setPendingStatus(status);
    setShowConfirm(true);
  };

  const handleAction = async (status) => {
    setLoadingAction(status);
    try {
      // Premium simulation delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));
      onVerify(data.id, status);
      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };



  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 bg-white">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            {mode === "detail"
              ? "Detail Kelayakan Sertifikat"
              : mode === "ubah"
                ? "Ubah Status Verifikasi"
                : "Verifikasi Kelayakan Sertifikat"
            }
          </h3>
        </div>

        <div className="overflow-y-auto max-h-[80vh] p-7 flex flex-col gap-6">
          {/* Student Info Card */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100/80 flex flex-col gap-3">
            <div className="flex flex-col gap-1 items-start">
              <h4 className="text-[16px] font-bold text-[#1E293B]">
                {data.nama} <span className="text-gray-500 text-[14px] font-medium ml-1">- {data.nim}</span>
              </h4>
              <p className="text-[13px] text-[#64748B]">{data.mataKuliah}</p>
            </div>
          </div>

          {/* Checklist Requirements */}
          <div className="flex flex-col gap-4">
            {/* Sertifikat Pelatihan */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
              <h5 className="text-[13px] font-bold text-[#1E293B] mb-2 flex items-center justify-between">
                <span>Sertifikat Pelatihan</span>
                {isKehadiranMet ? (
                  <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Layak</span>
                ) : (
                  <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Tidak Layak</span>
                )}
              </h5>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${
                isKehadiranMet ? 'bg-[#F0FAF6] border-[#167A61]/20' : 'bg-[#FEF2F2] border-red-500/20'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isKehadiranMet ? 'bg-[#167A61] text-white' : 'bg-red-100 text-red-500'
                }`}>
                  {isKehadiranMet ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </div>
                <span className={`text-[13px] font-semibold ${
                  isKehadiranMet ? 'text-[#0E5C46]' : 'text-red-600'
                }`}>
                  Kehadiran minimal {kehadiranMinimal} / {kehadiranTotal} (Tercapai: {kehadiranTercapai})
                </span>
              </div>
            </div>

            {/* Sertifikat Kelulusan */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
              <h5 className="text-[13px] font-bold text-[#1E293B] mb-2 flex items-center justify-between">
                <span>Sertifikat Kelulusan</span>
                {isNilaiMet ? (
                  <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Layak</span>
                ) : (
                  <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Tidak Layak</span>
                )}
              </h5>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${
                isNilaiMet ? 'bg-[#F0FAF6] border-[#167A61]/20' : 'bg-[#FEF2F2] border-red-500/20'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isNilaiMet ? 'bg-[#167A61] text-white' : 'bg-red-100 text-red-500'
                }`}>
                  {isNilaiMet ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </div>
                <span className={`text-[13px] font-semibold ${
                  isNilaiMet ? 'text-[#0E5C46]' : 'text-red-600'
                }`}>
                  Nilai akhir minimal 70.00 (Tercapai: {nilaiAkhir.toFixed(2)})
                </span>
              </div>
            </div>

            {/* Daftar Nilai */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100">
              <h5 className="text-[13px] font-bold text-[#1E293B] mb-2 flex items-center justify-between">
                <span>Daftar Nilai</span>
                <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Otomatis Layak</span>
              </h5>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors bg-[#F0FAF6] border-[#167A61]/20`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#167A61] text-white`}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className={`text-[13px] font-semibold text-[#0E5C46]`}>
                  Seluruh tugas telah dinilai ({tugasTercapai}/{tugasTotal} tugas)
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility / Status Alert Box */}
          {mode === "verifikasi" ? (
            isAllMet ? (
              <div className="bg-[#ECFDF5] border border-[#ECFDF5] rounded-xl px-5 py-3.5">
                <p className="text-[13px] font-semibold text-[#008B5E] leading-relaxed">
                  Mahasiswa ini memenuhi seluruh persyaratan untuk mendapatkan sertifikat.
                </p>
              </div>
            ) : (
              <div className="bg-[#FDF2F2] border border-[#FDF2F2] rounded-xl px-5 py-3.5">
                <p className="text-[13px] font-semibold text-[#EF4444] leading-relaxed">
                  Mahasiswa ini tidak memenuhi seluruh persyaratan untuk mendapatkan sertifikat.
                </p>
              </div>
            )
          ) : (
            // Mode "ubah" or "detail" - show the status box without "catatan" (notes)
            data.status === "DISETUJUI" ? (
              <div className="bg-[#ECFDF5] border border-[#ECFDF5] rounded-xl px-5 py-3.5">
                <p className="text-[13px] font-bold text-[#008B5E]">
                  Status: Layak (Disetujui)
                </p>
              </div>
            ) : data.status === "DITOLAK" ? (
              <div className="bg-[#FDF2F2] border border-[#FDF2F2] rounded-xl px-5 py-3.5">
                <p className="text-[13px] font-bold text-[#EF4444]">
                  Status: Tidak Layak (Ditolak)
                </p>
              </div>
            ) : (
              <div className="bg-[#FFF9E6] border border-[#FFF9E6] rounded-xl px-5 py-3.5">
                <p className="text-[13px] font-bold text-[#D97706]">
                  Status: Menunggu Verifikasi
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          {mode === "detail" ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={!!loadingAction}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleInitiateAction("DITOLAK")}
                disabled={!!loadingAction}
                className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Ditolak
              </button>
              <button
                type="button"
                onClick={() => handleInitiateAction("DISETUJUI")}
                disabled={!!loadingAction}
                className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Disetujui
              </button>
            </>
          )}
        </div>
      </div>

      {/* Secondary Confirmation Modal Overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-[360px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  pendingStatus === "DISETUJUI" ? "bg-emerald-50" : "bg-red-50"
                }`}
              >
                {pendingStatus === "DISETUJUI" ? (
                  <CheckCircle
                    className="text-emerald-500"
                    size={24}
                    strokeWidth={2}
                  />
                ) : (
                  <XCircle className="text-red-500" size={24} strokeWidth={2} />
                )}
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">
                {pendingStatus === "DISETUJUI" ? "Setujui Pengajuan?" : "Tolak Pengajuan?"}
              </h3>
              <p className="text-[13px] text-gray-400 leading-relaxed">
                Apakah Anda yakin ingin {pendingStatus === "DISETUJUI" ? "menyetujui" : "menolak"} pengajuan sertifikat untuk{" "}
                <span className="font-semibold text-gray-600">{data.nama}</span>?
              </p>
            </div>

            <div className="px-8 pb-7 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleAction(pendingStatus)}
                disabled={!!loadingAction}
                className={`w-full py-3 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  pendingStatus === "DISETUJUI"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {loadingAction ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Memproses...
                  </>
                ) : pendingStatus === "DISETUJUI" ? (
                  "Ya, Setujui"
                ) : (
                  "Ya, Tolak"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingStatus(null);
                }}
                disabled={!!loadingAction}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
