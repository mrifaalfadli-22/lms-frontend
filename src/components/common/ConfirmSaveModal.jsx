import { Check, X } from "lucide-react";

export default function ConfirmSaveModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-[380px] overflow-hidden shadow-xl">
        {/* Body */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#F0FAF6] rounded-2xl flex items-center justify-center mb-5">
            <Check size={24} className="text-[#167A61]" strokeWidth={3} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">
            {title || "Simpan Perubahan?"}
          </h3>
          <p className="text-[13px] text-gray-400 leading-relaxed px-2">
            {message || "Apakah Anda yakin ingin menyimpan perubahan yang telah dilakukan?"}
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-7 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Ya, Simpan
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
