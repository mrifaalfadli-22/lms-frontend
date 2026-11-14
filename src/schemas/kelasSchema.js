import * as Yup from "yup";

export const kelasSchema = Yup.object().shape({
  nama_kelas: Yup.string()
    .min(2, "Nama kelas terlalu pendek")
    .max(50, "Nama kelas maksimal 50 karakter")
    .required("Nama kelas wajib diisi"),
  kode_kelas: Yup.string()
    .max(10, "Kode kelas maksimal 10 karakter")
    .required("Kode kelas wajib diisi"),
});

export const kelasEditSchema = kelasSchema;
