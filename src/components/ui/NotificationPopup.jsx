import { X, Check } from "lucide-react";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

const VARIANTS = {
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50",
    iconBgClass: "bg-emerald-100",
    btnClass: "text-emerald-600 hover:bg-emerald-50 border-emerald-100",
    btnIcon: Check,
    btnLabel: "Mengerti",
    defaultTitle: "Berhasil",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50",
    iconBgClass: "bg-red-100",
    btnClass: "text-red-500 hover:bg-red-50 border-red-100",
    btnIcon: X,
    btnLabel: "Tutup",
    defaultTitle: "Terjadi Kesalahan",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50",
    iconBgClass: "bg-amber-100",
    btnClass: "text-amber-600 hover:bg-amber-50 border-amber-100",
    btnIcon: X,
    btnLabel: "Tutup",
    defaultTitle: "Peringatan",
  },
};

export default function NotificationPopup({
  message,
  title,
  type = "error",
  onClose,
}) {
  if (!message) return null;

  const v = VARIANTS[type] || VARIANTS.error;
  const Icon = v.icon;
  const BtnIcon = v.btnIcon;
  const displayTitle = title || v.defaultTitle;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[360px] overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Body */}
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          <div
            className={`w-[60px] h-[60px] rounded-full ${v.iconBgClass} flex items-center justify-center mb-4`}
          >
            <Icon className={v.iconClass} size={28} />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">
            {displayTitle}
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className={`w-full py-3.5 border-t ${v.btnClass} text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5`}
        >
          <BtnIcon size={15} />
          {v.btnLabel}
        </button>
      </div>
    </div>
  );
}
