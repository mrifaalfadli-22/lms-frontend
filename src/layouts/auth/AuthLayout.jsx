import { Outlet } from "react-router-dom"; // Tambahkan import ini
import bgLogin from "../../assets/images/bg-login.png";

export default function AuthLayout() {
  // Hapus prop children
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#167A61] to-[#0E5C46] flex items-center justify-center relative">
      {/* BG Image */}
      <img
        src={bgLogin}
        alt="bg"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[180px]"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Gunakan Outlet sebagai pengganti children */}
        <Outlet />
      </div>
    </div>
  );
}
