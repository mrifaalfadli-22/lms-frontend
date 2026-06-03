// components/admin/ConfirmSaveModal.jsx
// Reusable modal konfirmasi sebelum menyimpan perubahan data
import { Save, Loader2 } from "lucide-react";

export default function ConfirmSaveModal({
  isOpen,
  onConfirm,
  onCancel,
  loading,
  title = "Simpan Perubahan",
  description = "Apakah kamu yakin ingin menyimpan perubahan data ini?",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[380px] overflow-hidden shadow-xl">
        {/* Body */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          {/* Icon Box - Menggunakan rounded-2xl dan warna hijau tema kamu */}
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5">
            <Save size={24} className="text-[#167A61]" strokeWidth={2} />
          </div>

          <h3 className="text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions - Desain tumpuk vertikal konsisten dengan delete modal */}
        <div className="px-8 pb-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Ya, Simpan"
            )}
          </button>

          <button
            type="button"
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
