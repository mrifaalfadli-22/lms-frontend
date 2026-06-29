import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "../../services/authService";
import Input from "../../components/ui/Input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Email tidak boleh kosong");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await authService.forgotPassword(email);
      setStatus("success");
      setMessage(res.message || "Link reset kata sandi telah dikirim ke email Anda.");
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Gagal mengirim link reset. Pastikan email terdaftar.");
    }
  };

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
            Lupa Kata Sandi?
          </h2>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan tautan untuk mereset kata sandi Anda.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F0FAF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-[#167A61]" size={32} />
            </div>
            <p className="text-[#1E293B] text-[14px] font-semibold mb-6">
              {message}
            </p>
            <Link
              to="/login"
              className="w-full flex items-center justify-center py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[14px] font-bold rounded-xl transition-colors shadow-sm"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {status === "error" && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-[13px] text-red-600 font-semibold">{message}</p>
              </div>
            )}

            <Input
              label="Alamat Email"
              type="email"
              placeholder="Masukkan email Anda"
              icon={<Mail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {status === "loading" ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        )}

        {status !== "success" && (
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#64748B] hover:text-[#167A61] transition-colors"
            >
              <ArrowLeft size={14} />
              Kembali ke Halaman Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
