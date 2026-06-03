import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const navigate = useNavigate();

  const register = async (values) => {
    setLoading(true);
    setErrorMsg(null);
    setErrorType("error");

    try {
      await authService.registerDosen(values);
      // Pakai pesan langsung dari BE
      setSuccessMsg(
        "Registrasi berhasil. Akun Anda sedang menunggu verifikasi oleh Admin.",
      );
    } catch (err) {
      const status = err.status;

      if (status === 0 || status >= 500) {
        setErrorType("warning");
      } else {
        setErrorType("error");
      }

      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (values, role) => {
    setLoading(true);
    setErrorMsg(null);
    setErrorType("error");

    try {
      const user = await authService.login(values, role);
      const targetRole = user.role.toLowerCase();
      navigate(`/${targetRole}/dashboard`);
    } catch (err) {
      const status = err.status;

      if (status === 0 || status >= 500) {
        // Koneksi/server error
        setErrorType("warning");
      } else if (status === 403) {
        // Akun menunggu verifikasi / ditolak / dinonaktifkan
        // Pesan langsung dari BE, misal:
        // "Akun Anda sedang dalam proses verifikasi oleh Admin."
        // "Akun Anda telah ditolak."
        // "Akun Anda telah dinonaktifkan."
        setErrorType("warning");
      } else {
        // 401 kredensial salah, 422 validasi, dll
        setErrorType("error");
      }

      // Tampilkan pesan apa adanya dari BE, tidak dimodifikasi
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const currentRole = localStorage.getItem("user_role")?.toLowerCase();
    authService.logout();

    if (currentRole === "admin") {
      navigate("/login-admin");
    } else {
      navigate("/login");
    }
  };

  return {
    login,
    logout,
    register,
    loading,
    errorMsg,
    errorType,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
  };
};
