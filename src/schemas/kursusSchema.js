import * as Yup from "yup";

export const kursusSchema = Yup.object().shape({
  kode_mk: Yup.string()
    .max(10, "Kode kursus maksimal 10 karakter")
    .required("Kode kursus wajib diisi"),
  nama_mk: Yup.string()
    .min(3, "Nama terlalu pendek")
    .max(100, "Nama maksimal 100 karakter")
    .required("Nama kursus wajib diisi"),
  deskripsi: Yup.string().nullable(),
});

export const kursusEditSchema = kursusSchema;
