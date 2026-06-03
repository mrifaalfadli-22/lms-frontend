import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LogoutPopup from "../../components/ui/LogoutPopup";
import bgAside from "../../assets/images/bg-aside.svg";

const menuItems = [
  { name: "Dashboard", path: "/dosen/dashboard" },
  {
    name: "Kelola Sesi Pertemuan",
    path: "/dosen/kelola-sesi-pertemuan",
  },
  { name: "Monitoring Progres", path: "/dosen/monitoring-progres" },
  { name: "Forum Diskusi", path: "/dosen/forum-diskusi" },
  { name: "Verifikasi Sertifikat", path: "/dosen/verifikasi-sertifikat" },
];

export default function Sidebar(role = "dosen") {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // Ambil fungsi logout dari hook
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout(); // Menghapus localStorage & redirect ke login
  };

  return (
    <>
      {/* Panggil Popup Logout */}
      <LogoutPopup
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      <aside className="w-[260px] bg-gradient-to-r from-[#167A61] to-[#0E5C46] text-white h-full flex flex-col px-5 py-8 flex-shrink-0 relative overflow-hidden">
        {/* Logo */}
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-black tracking-tight">u-Cademy</h1>
          <p className="text-sm text-[#FCEEA7] font-normal uppercase mt-[2px]">
            Dosen
          </p>
        </div>

        <hr className="border-white/10 mb-[24px]" />

        {/* Navigasi Menu */}
        <nav className="flex-1 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg text-[15px] transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#0E5C46] shadow-sm font-semibold"
                    : "text-white/75 hover:bg-white/10 hover:text-white font-normal"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Area bawah: SVG dekoratif + Logout */}
        <div className="relative -mx-5 -mb-8 h-[240px] flex items-end px-5 pb-8">
          <img
            src={bgAside}
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-full object-cover object-bottom pointer-events-none select-none"
          />

          {/* Tombol Logout tetap di atas SVG karena z-10 */}
          <button
            onClick={() => setShowLogoutModal(true)} // Tampilkan modal saat diklik
            className="relative z-10 w-full bg-red-500/10 border border-red-500/30 py-3
          rounded-lg text-[15px] text-[#FECDD3] hover:bg-red-500/20 
          hover:border-red-500/40 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
