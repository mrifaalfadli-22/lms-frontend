import * as Yup from "yup";

// Schema untuk TAMBAH (tanpa status_aktif)
export const mahasiswaSchema = Yup.object().shape({
  nama_lengkap: Yup.string()
    .min(3, "Nama terlalu pendek")
    .required("Nama lengkap wajib diisi"),
  nomor_induk: Yup.string()
    .matches(/^[0-9]+$/, "NPM harus berupa angka")
    .min(8, "NPM minimal 8 digit")
    .required("NPM wajib diisi"),
  fakultas: Yup.string().required("Fakultas wajib dipilih"),
  prodi: Yup.string().required("Program studi wajib dipilih"),
  angkatan: Yup.string().required("Angkatan wajib dipilih"),
});

// Schema untuk EDIT (sama + status_aktif)
export const mahasiswaEditSchema = Yup.object().shape({
  nama_lengkap: Yup.string()
    .min(3, "Nama terlalu pendek")
    .required("Nama lengkap wajib diisi"),
  nomor_induk: Yup.string()
    .matches(/^[0-9]+$/, "NPM harus berupa angka")
    .min(8, "NPM minimal 8 digit")
    .required("NPM wajib diisi"),
  fakultas: Yup.string().required("Fakultas wajib dipilih"),
  prodi: Yup.string().required("Program studi wajib dipilih"),
  angkatan: Yup.string().required("Angkatan wajib dipilih"),
  status_aktif: Yup.boolean().required("Status wajib dipilih"),
});
