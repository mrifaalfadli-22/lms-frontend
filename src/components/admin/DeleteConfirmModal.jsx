import { Trash2, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({
  data,
  fields = [],
  title = "Hapus Data",
  onConfirm,
  onCancel,
  loading,
}) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[380px] overflow-hidden shadow-xl">
        {/* Body */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <Trash2 size={24} className="text-red-500" strokeWidth={2} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Yakin ingin menghapus data berikut secara permanen?
          </p>

          <div className="mt-4 w-full bg-[#F8FAFA] rounded-xl px-4 py-3 text-left space-y-1.5">
            {fields.map(({ label, key }) => (
              <div key={key} className="flex justify-between text-[13px]">
                <span className="text-gray-400 font-medium">{label}</span>
                <span className="text-gray-800 font-semibold text-right max-w-[200px]">
                  {data[key] || "-"}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-red-400 mt-3 font-medium">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-7 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus"
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
