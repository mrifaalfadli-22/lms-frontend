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
        setErrorType("warning");
      } else if (status === 403) {
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

