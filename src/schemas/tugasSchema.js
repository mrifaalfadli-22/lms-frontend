import * as Yup from "yup";

export const tugasSchema = Yup.object().shape({
  judul: Yup.string()
    .required("Judul tugas wajib diisi"),
  tautan: Yup.string()
    .url("Format tautan tidak valid")
    .required("Tautan CBT wajib diisi"),
  token: Yup.string()
    .required("Token CBT wajib diisi"),
  batasWaktu: Yup.string()
    .required("Batas waktu pengumpulan wajib diisi"),
});
