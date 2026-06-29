import { useLocation, useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { usePrayerTimes } from "../../hooks/usePrayerTimes";

const pageTitles = {
  "/admin/dashboard": "Dashboard Admin",
  "/admin/kelola-pengguna": "Kelola Data Pengguna",
  "/admin/kelola-kelas": "Kelola Data Kelas",
  "/admin/kelola-mata-kuliah": "Kelola Mata Kuliah",
  "/admin/kelola-jadwal-perkuliahan": "Kelola Jadwal Perkuliahan",
  "/admin/kelola-materi-perkuliahan": "Kelola Materi Perkuliahan",
  "/admin/forum-diskusi": "Kelola Forum Diskusi",
  "/admin/kelola-sertifikat": "Kelola Sertifikat",
  "/admin/verifikasi-dosen": "Verifikasi Dosen",
  "/admin/profil": "Profil Admin",
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useProfile();
  const { currentPrayer, loading } = usePrayerTimes();

  // Defensive Check: Coba ambil nama_lengkap, jika tidak ada cari field 'name'
  const fullName = user?.nama_lengkap || user?.name || "";

  const initials = fullName
    ? fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "--";

  const currentTitle =
    pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([key]) => location.pathname.startsWith(key + "/"))?.[1] ||
    "Dashboard";

  return (
    <header className="flex justify-between items-center">
      <div>
        <p className="text-sm text-[#64748B] font-semibold mb-0.5">
          Assalamu'alaikum{fullName ? `, ${fullName}` : "."}
        </p>
        <h2 className="text-3xl font-bold text-[#1E293B] leading-tight">
          {currentTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="bg-gradient-to-r from-[#167A61] to-[#0E5C46] 
          text-white px-5 py-2 rounded-full text-[13px] font-semibold shadow-sm whitespace-nowrap"
        >
          {loading
            ? "Memuat waktu sholat..."
            : currentPrayer
              ? `Waktu Adzan  •  ${currentPrayer.name} (${currentPrayer.time})`
              : "Tidak tersedia"}
        </div>

        <div
          onClick={() => navigate("/admin/profil")}
          className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-[#1E293B] leading-none">
              Admin System
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              {fullName || "Memuat..."}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-[#167A61] to-[#0E5C46] rounded-full flex items-center justify-center text-white text-base font-normal flex-shrink-0 overflow-hidden">
            {user?.foto_profil_url ? (
              <img
                src={user.foto_profil_url}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
