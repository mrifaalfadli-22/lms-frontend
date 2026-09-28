import { useState } from "react";
import { authService } from "../services/authService";
import { EPORTAL_URL } from "../config/eportal";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorType, setErrorType] = useState("error");

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

  const logout = () => {
    authService.logout();
    window.location.href = EPORTAL_URL;
  };

  return {
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
