import * as Yup from "yup";

// Validasi untuk Portal Dosen
export const dosenLoginSchema = Yup.object().shape({
  identifier: Yup.string().required("NIDN or Email is required"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .matches(/[a-zA-Z]/, "Password harus mengandung huruf")
    .matches(/[0-9]/, "Password harus mengandung angka")
    .required("Password is required"),
});

// Validasi untuk Portal Admin
export const adminLoginSchema = Yup.object().shape({
  identifier: Yup.string().required("Username or Email is required"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .matches(/[a-zA-Z]/, "Password harus mengandung huruf")
    .matches(/[0-9]/, "Password harus mengandung angka")
    .required("Password is required"),
});

// --- Register Schema ---
export const registerSchema = Yup.object().shape({
  nama_lengkap: Yup.string()
    .min(3, "Nama terlalu pendek")
    .required("Nama lengkap wajib diisi"),

  nidn: Yup.string()
    .matches(/^[0-9]+$/, "NIDN harus berupa angka")
    .min(10, "NIDN minimal 10 digit")
    .max(12, "NIDN maksimal 12 digit")
    .required("NIDN wajib diisi"),

  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),

  fakultas: Yup.string().required("Fakultas wajib dipilih"),

  prodi: Yup.string().required("Program studi wajib dipilih"),

  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .matches(/[a-zA-Z]/, "Password harus mengandung huruf")
    .matches(/[0-9]/, "Password harus mengandung angka")
    .required("Password wajib diisi"),

  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password"), null], "Password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
});
