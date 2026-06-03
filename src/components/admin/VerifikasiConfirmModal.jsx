import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifikasiConfirmModal({
  data,
  aksi,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!data || !aksi) return null;

  const isSetujui = aksi === "Disetujui";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[360px] shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isSetujui ? "bg-emerald-50" : "bg-red-50"}`}
          >
            {isSetujui ? (
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
            {isSetujui ? "Setujui Pengajuan?" : "Tolak Pengajuan?"}
          </h3>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-600">
              {data.nama_lengkap}
            </span>
            {isSetujui
              ? " akan diverifikasi dan mendapatkan akses ke sistem."
              : " akan ditolak dan pengajuannya tidak akan diproses."}
          </p>
        </div>

        <div className="px-8 pb-7 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-3 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isSetujui
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Memproses...
              </>
            ) : isSetujui ? (
              "Ya, Setujui"
            ) : (
              "Ya, Tolak"
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
