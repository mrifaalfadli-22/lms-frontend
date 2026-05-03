import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const login = async (values, role) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await authService.login(values, role);
      // Jika berhasil, arahkan ke dashboard sesuai role
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMBAHKAN FUNGSI INI ---
  const logout = () => {
    // 1. Ambil role dulu sebelum datanya dihapus
    const currentRole = localStorage.getItem("user_role");

    // 2. Jalankan pembersihan di service (localStorage.clear())
    authService.logout();

    // 3. Tentukan arah navigasi berdasarkan role terakhir
    if (currentRole === "admin") {
      navigate("/login-admin");
    } else {
      navigate("/login");
    }
  };
  // ----------------------------

  // --- PASTIKAN 'logout' ADA DI SINI ---
  return { login, logout, loading, errorMsg, setErrorMsg };
};
