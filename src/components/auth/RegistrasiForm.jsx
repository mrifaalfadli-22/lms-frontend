import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../../schemas/authSchema";
import Input from "../ui/Input";
import Button from "../ui/Button";
import googleIcon from "../../assets/images/google.svg";

export default function RegisterForm() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: "",
      nidn: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      console.log("Register Data:", values);
      // TODO: call authService.registerDosen(values)
    },
  });

  return (
    <div className="bg-[#F8FAFA] w-[650px] rounded-[28px] shadow-2xl px-12 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-3xl font-black text-[#0E5C46] tracking-tight">
          u-Cademy
        </h1>
        <p className="text-sm font-medium text-gray-400 mt-1">
          Registrasi Akun Dosen
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full">
        {/* Nama Lengkap — full width */}
        <Input
          label="Nama Lengkap"
          name="fullName"
          placeholder="Masukkan nama lengkap Anda"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.fullName}
          error={formik.errors.fullName}
          touched={formik.touched.fullName}
        />

        {/* NIDN + Email — 2 kolom */}
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="NIDN"
            name="nidn"
            placeholder="Masukkan NIDN Anda"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.nidn}
            error={formik.errors.nidn}
            touched={formik.touched.nidn}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Masukkan email aktif"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            error={formik.errors.email}
            touched={formik.touched.email}
          />
        </div>

        {/* Password + Konfirmasi — 2 kolom */}
        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Buat password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            error={formik.errors.password}
            touched={formik.touched.password}
          />
          <Input
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            error={formik.errors.confirmPassword}
            touched={formik.touched.confirmPassword}
          />
        </div>

        {/* Tombol Daftar */}
        <div className="mt-4">
          <Button type="submit">Daftar</Button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-sm text-gray-400 font-bold">atau</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <Button type="button" variant="outline">
          <img src={googleIcon} className="w-5 h-5" alt="google" />
          Daftar dengan Google
        </Button>

        {/* Kembali ke login */}
        <p className="text-center mt-6 text-sm text-gray-500 font-medium">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#1A7A5F] font-extrabold hover:underline"
          >
            Masuk
          </button>
        </p>
      </form>
    </div>
  );
}
