import { XCircle, X, AlertTriangle } from "lucide-react";

export default function ErrorPopup({ message, onClose }) {
  if (!message) return null;

  // Cek apakah error karena koneksi server (Network Error)
  const isServerError =
    message.toLowerCase().includes("koneksi") ||
    message.toLowerCase().includes("server");

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[380px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div
          className={
            isServerError
              ? "bg-amber-50 p-6 flex flex-col items-center text-center"
              : "bg-red-50 p-6 flex flex-col items-center text-center"
          }
        >
          <div
            className={
              isServerError
                ? "w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4"
                : "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
            }
          >
            {isServerError ? (
              <AlertTriangle className="text-amber-500" size={32} />
            ) : (
              <XCircle className="text-red-500" size={32} />
            )}
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-2">
            {isServerError ? "Gangguan Server" : "Login Gagal"}
          </h3>

          <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-4 bg-white border-t border-gray-100 text-sm font-black transition-colors flex items-center justify-center gap-2 ${
            isServerError
              ? "text-amber-600 hover:bg-amber-50"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          <X size={16} /> TUTUP
        </button>
      </div>
    </div>
  );
}
