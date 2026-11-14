import { useFormik } from "formik";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { dosenLoginSchema, adminLoginSchema } from "../../schemas/authSchema";
import Input from "../ui/Input";
import Button from "../ui/Button";
import NotificationPopup from "../ui/NotificationPopup";
import { EPORTAL_URL } from "../../config/eportal";

export default function LoginForm({ role = "dosen" }) {
  const isAdmin = role === "admin";
  const navigate = useNavigate();

  const { login, loading, errorMsg, errorType, setErrorMsg } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.errorMsg) {
      setErrorMsg(location.state.errorMsg);
      window.history.replaceState({}, document.title);
    }
  }, [location, setErrorMsg]);

  const formik = useFormik({
    initialValues: { identifier: "", password: "" },
    validationSchema: isAdmin ? adminLoginSchema : dosenLoginSchema,
    onSubmit: (values) => {
      login(values, role);
    },
  });

  return (
    <>
      <NotificationPopup
        type={errorType}
        message={errorMsg}
        onClose={() => setErrorMsg(null)}
      />

      <div className="bg-[#F8FAFA] w-[420px] rounded-[28px] shadow-2xl px-10 py-8 flex flex-col items-center">
        <div className="text-center mb-7">
          <h1 className="text-3xl font-black text-[#0E5C46] tracking-tight">
            u-Cademy
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {isAdmin ? "Login Portal Admin" : "Login Portal Pengajar"}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="w-full">
          <Input
            label={isAdmin ? "Username atau Email" : "NIDN atau Email"}
            name="identifier"
            placeholder={
              isAdmin
                ? "Masukkan Username atau Email"
                : "Masukkan NIDN atau Email"
            }
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.identifier}
            error={formik.errors.identifier}
            touched={formik.touched.identifier}
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Masukkan password Anda"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.errors.password}
            touched={formik.touched.password}
            disabled={loading}
          />

          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-[#1A7A5F] text-[13px] font-bold hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <div className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 font-bold uppercase">atau</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              window.location.href = EPORTAL_URL;
            }}
          >
            Masuk via SSO E-Portal
          </Button>

          <div className="text-center mt-6 text-sm text-gray-500">
            {isAdmin ? (
              <p>
                Bukan admin?{" "}
                <Link to="/login" className="text-[#1A7A5F] font-bold hover:underline">
                  Login Pengajar
                </Link>
              </p>
            ) : (
              <p>
                Admin LMS?{" "}
                <Link to="/login-admin" className="text-[#1A7A5F] font-bold hover:underline">
                  Login Admin
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
