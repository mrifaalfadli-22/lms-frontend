import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { registerSchema } from "../../schemas/authSchema";
import { fakultasData } from "../../data/fakultasData";
import { useAuth } from "../../hooks/useAuth";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import Button from "../ui/Button";
import NotificationPopup from "../ui/NotificationPopup";

export default function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    loading,
    errorMsg,
    errorType,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
  } = useAuth();

  const formik = useFormik({
    initialValues: {
      nama_lengkap: "",
      nidn: "",
      email: "",
      fakultas: "",
      prodi: "",
      password: "",
      password_confirmation: "",
    },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      register(values);
    },
  });

  const selectedFakultas = fakultasData.find(
    (f) => f.value === formik.values.fakultas,
  );
  const prodiOptions = selectedFakultas?.prodi || [];

  const handleFakultasChange = (e) => {
    formik.setFieldValue("fakultas", e.target.value);
    formik.setFieldValue("prodi", "");
  };

  return (
    <>
      {/* Error / Warning popup */}
      <NotificationPopup
        type={errorType}
        message={errorMsg}
        onClose={() => setErrorMsg(null)}
      />

      {/* Success popup — setelah tutup, redirect ke login */}
      <NotificationPopup
        type="success"
        title="Registrasi Berhasil"
        message={successMsg}
        onClose={() => {
          setSuccessMsg(null);
          navigate("/login");
        }}
      />

      <div className="bg-[#F8FAFA] w-[750px] rounded-[28px] shadow-2xl px-12 py-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/uCademy-icon.svg"
            alt="u-Cademy Logo"
            className="w-16 h-16 mx-auto"
          />
          <h1 className="text-3xl font-black text-[#0E5C46] tracking-tight">
            u-Cademy
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-1">
            Registrasi Akun Dosen
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="w-full">
          {/* Nama Lengkap */}
          <Input
            label="Nama Lengkap"
            name="nama_lengkap"
            placeholder="Masukkan nama lengkap Anda"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.nama_lengkap}
            error={formik.errors.nama_lengkap}
            touched={formik.touched.nama_lengkap}
            disabled={loading}
          />

          {/* NIDN + Email */}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Fakultas + Prodi */}
          <div className="grid grid-cols-2 gap-5">
            <SearchableSelect
              label="Fakultas"
              name="fakultas"
              value={formik.values.fakultas}
              onChange={handleFakultasChange}
              onBlur={() => formik.setFieldTouched("fakultas", true)}
              options={fakultasData}
              placeholder="Pilih Fakultas"
              error={formik.errors.fakultas}
              touched={formik.touched.fakultas}
              disabled={loading}
            />
            <SearchableSelect
              label="Program Studi"
              name="prodi"
              value={formik.values.prodi}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched("prodi", true)}
              options={prodiOptions}
              placeholder="Pilih Program Studi"
              disabled={!formik.values.fakultas || loading}
              disabledMessage={
                !formik.values.fakultas ? "Pilih fakultas terlebih dahulu" : ""
              }
              error={formik.errors.prodi}
              touched={formik.touched.prodi}
            />
          </div>

          {/* Password + Konfirmasi */}
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
              disabled={loading}
            />
            <Input
              label="Konfirmasi Password"
              name="password_confirmation"
              type="password"
              placeholder="Ulangi password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password_confirmation}
              error={formik.errors.password_confirmation}
              touched={formik.touched.password_confirmation}
              disabled={loading}
            />
          </div>

          <div className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#1A7A5F] font-extrabold hover:underline"
              disabled={loading}
            >
              Masuk
            </button>
          </p>
        </form>
      </div>
    </>
  );
}
