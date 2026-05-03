import { LogOut } from "lucide-react";

export default function LogoutPopup({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[360px] shadow-xl overflow-hidden">
        {/* Body */}
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
            <LogOut className="text-red-500" size={24} strokeWidth={2} />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-2">
            Keluar dari Akun?
          </h3>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Sesi Anda akan berakhir dan Anda perlu masuk kembali untuk mengakses
            u-Cademy.
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-7 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors"
          >
            Ya, Keluar
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
