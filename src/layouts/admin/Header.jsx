import { useLocation } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";

// Mapping path ke judul header
const pageTitles = {
  "/admin/dashboard": "Dashboard Admin",
  "/admin/kelola-pengguna": "Kelola Data Pengguna",
  "/admin/kelola-mata-kuliah": "Kelola Mata Kuliah",
  "/admin/forum-diskusi": "Kelola Forum Diskusi",
  "/admin/kelola-sertifikat": "Kelola Sertifikat",
  "/admin/verifikasi-dosen": "Verifikasi Dosen",
};

export default function Header() {
  const location = useLocation();
  const { user, loading } = useProfile(); // Ambil data user dari hook

  if (loading)
    return <div className="h-20 animate-pulse bg-gray-100 rounded-xl" />;
  if (!user) return null;

  // Inisial Nama (Contoh: "Muhammad Rifa" -> "MR")
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Ambil judul berdasarkan path aktif, default ke "Dashboard" jika tidak ditemukan
  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  return (
    <header className="flex justify-between items-center">
      <div>
        <p className="text-sm text-[#64748B] font-semibold mb-0.5">
          Assalamu'alaikum, {user.name}.
        </p>
        <h2 className="text-3xl font-bold text-[#1E293B] leading-tight">
          {currentTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Widget Waktu Adzan */}
        <div
          className="bg-gradient-to-r from-[#167A61] to-[#0E5C46] 
          text-white px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm whitespace-nowrap"
        >
          Waktu Adzan • Dzuhur (12:10)
        </div>

        {/* Profil Admin */}
        <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1E293B] leading-none">
              Admin System
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">{user.name}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-[#167A61] to-[#0E5C46] rounded-full flex items-center justify-center text-white text-base font-normal flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
