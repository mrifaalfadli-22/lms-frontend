import { Smartphone } from "lucide-react";
import { EPORTAL_URL } from "../../config/eportal";

export default function MobileOnly() {
  return (
    <div className="bg-[#F8FAFA] w-[420px] rounded-[28px] shadow-2xl px-10 py-8 flex flex-col items-center text-center">
      <Smartphone size={48} className="text-[#0E5C46] mb-4" />
      <h1 className="text-xl font-black text-[#0E5C46]">
        Gunakan Aplikasi Mobile
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Untuk Peserta, u-Cademy diakses lewat aplikasi mobile, bukan lewat website ini.
        Silakan buka aplikasi u-Cademy di perangkat Anda.
      </p>
      <a
        href={EPORTAL_URL}
        className="mt-6 text-[#1A7A5F] text-sm font-bold hover:underline"
      >
        Kembali ke E-Portal
      </a>
    </div>
  );
}
