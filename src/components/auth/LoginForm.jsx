import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Import hook yang baru dibuat
import { dosenLoginSchema, adminLoginSchema } from "../../schemas/authSchema";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorPopup from "../ui/ErrorPopup"; // Import popup error
import googleIcon from "../../assets/images/google.svg";

export default function LoginForm({ role = "dosen" }) {
  const isAdmin = role === "admin";
  const navigate = useNavigate();

  // Ambil fungsi dan state dari useAuth hook
  const { login, loading, errorMsg, setErrorMsg } = useAuth();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: isAdmin ? adminLoginSchema : dosenLoginSchema,
    onSubmit: (values) => {
      // Panggil fungsi login dari hook dengan menyertakan role
      login(values, role);
    },
  });

  return (
    <>
      {/* Tampilkan popup jika ada pesan error dari proses login */}
      <ErrorPopup message={errorMsg} onClose={() => setErrorMsg(null)} />

      <div className="bg-[#F8FAFA] w-[420px] rounded-[28px] shadow-2xl px-10 py-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0E5C46] tracking-tight">
            u-Cademy
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1">
            {isAdmin ? "Admin Portal Login" : "Dosen Portal Login"}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="w-full">
          <Input
            label={isAdmin ? "Username or Email" : "NIDN or Email"}
            name="email"
            placeholder={
              isAdmin
                ? "Enter your Username or Email"
                : "Enter your NIDN or Email"
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            error={formik.errors.email}
            touched={formik.touched.email}
            disabled={loading} // Disable saat loading
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.errors.password}
            touched={formik.touched.password}
            disabled={loading} // Disable saat loading
          />

          <div className="mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-sm text-gray-400 font-bold">atau</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <Button type="button" variant="outline" disabled={loading}>
            <img src={googleIcon} className="w-5 h-5" alt="google" />
            Masuk dengan Google
          </Button>

          {!isAdmin && (
            <p className="text-center mt-8 text-sm text-gray-500 font-medium">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-[#1A7A5F] font-extrabold hover:underline"
                disabled={loading}
              >
                Daftar
              </button>
            </p>
          )}
        </form>
      </div>
    </>
  );
}
