import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "../../services/authService";

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const roleId = searchParams.get("role_id");
      const appModuleId = searchParams.get("appModule_id");

      if (!token || !roleId || !appModuleId) {
        navigate("/login", {
          state: { errorMsg: "Parameter SSO dari E-Portal tidak lengkap." },
          replace: true,
        });
        return;
      }

      try {
        const user = await authService.ssoLogin({ token, roleId, appModuleId });
        navigate(`/${user.role}/dashboard`, { replace: true });
      } catch (err) {
        navigate("/login", {
          state: { errorMsg: err.message || "Login via E-Portal gagal." },
          replace: true,
        });
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#167A61] to-[#0E5C46] flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="animate-spin mb-4" />
      <h2 className="text-xl font-bold">Memproses Login E-Portal...</h2>
      <p className="text-sm opacity-80 mt-2">Mohon tunggu sebentar, Anda sedang diarahkan.</p>
    </div>
  );
}
