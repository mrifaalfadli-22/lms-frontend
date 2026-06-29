import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "../../services/authService";
import Input from "../../components/ui/Input";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [formData, setFormData] = useState({
    email: emailParam || "",
    password: "",
    password_confirmation: ""
  });

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token reset kata sandi tidak valid atau tidak ditemukan.");
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!/[a-zA-Z]/.test(formData.password)) {
      setStatus("error");
      setMessage("Kata sandi baru harus mengandung huruf.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setStatus("error");
      setMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const payload = { ...formData, token };
      const res = await authService.resetPassword(payload);
      setStatus("success");
      setMessage(res.message || "Kata sandi Anda berhasil direset!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Gagal mereset kata sandi. Token mungkin sudah kedaluwarsa.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-8 max-w-[400px] w-full text-center">
          <p className="text-red-600 font-bold mb-6">{message}</p>
          <Link to="/login" className="text-[#167A61] font-bold hover:underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Logo */}
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-black text-[#fff] mb-2 tracking-tight">
          u-Cademy
        </h1>
        <p className="text-[14px] text-[#fff] font-medium">
          LMS Universitas Ibn Khaldun Bogor
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-8 md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-[22px] font-extrabold text-[#1E293B] mb-2">
            Buat Kata Sandi Baru
          </h2>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Silakan masukkan kata sandi baru Anda. Pastikan kombinasi aman dan mudah diingat.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F0FAF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-[#167A61]" size={32} />
            </div>
            <p className="text-[#1E293B] text-[14px] font-semibold mb-2">
              {message}
            </p>
            <p className="text-[#64748B] text-[13px] mb-6">
              Mengarahkan ke halaman login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {status === "error" && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-[13px] text-red-600 font-semibold">{message}</p>
              </div>
            )}

            {/* Hidden Email Field (but needed for Laravel) */}
            <input type="hidden" name="email" value={formData.email} />

            <Input
              label="Kata Sandi Baru"
              type="password"
              name="password"
              placeholder="Minimal 8 karakter"
              icon={<Lock size={16} />}
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              name="password_confirmation"
              placeholder="Ketik ulang kata sandi baru"
              icon={<Lock size={16} />}
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#167A61] hover:bg-[#0E5C46] disabled:bg-[#167A61]/70 text-white text-[14px] font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              {status === "loading" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {status === "loading" ? "Menyimpan..." : "Simpan Kata Sandi"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
