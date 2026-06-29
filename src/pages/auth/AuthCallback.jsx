import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "../../services/authService";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const error = searchParams.get("error");
      const token = searchParams.get("token");

      if (error) {
        // Redirect to login with error message
        navigate("/login", { state: { errorMsg: error }, replace: true });
        return;
      }

      if (token) {
        // Save token to localStorage
        localStorage.setItem("user_token", token);

        try {
          // Fetch user profile to know their role
          const user = await authService.getCurrentUser();
          
          if (user && user.role) {
            const normalizedRole = user.role.toLowerCase();
            localStorage.setItem("user_role", normalizedRole);
            
            // Redirect to appropriate dashboard
            navigate(`/${normalizedRole}/dashboard`, { replace: true });
          } else {
            // Invalid profile data
            throw new Error("Gagal mengambil data profil pengguna.");
          }
        } catch (err) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_role");
          navigate("/login", { 
            state: { errorMsg: "Terjadi kesalahan saat memuat profil. Silakan login kembali." }, 
            replace: true 
          });
        }
      } else {
        // No token or error provided
        navigate("/login", { replace: true });
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#167A61] to-[#0E5C46] flex flex-col items-center justify-center text-white">
      <Loader2 size={48} className="animate-spin mb-4" />
      <h2 className="text-xl font-bold">Memproses Otentikasi...</h2>
      <p className="text-sm opacity-80 mt-2">Mohon tunggu sebentar, Anda sedang diarahkan.</p>
    </div>
  );
}
