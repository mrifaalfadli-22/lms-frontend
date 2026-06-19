import * as Yup from "yup";

export const materiSchema = Yup.object().shape({
  judul: Yup.string()
    .required("Judul materi wajib diisi"),
  deskripsi: Yup.string()
    .required("Deskripsi materi wajib diisi"),
  link: Yup.string()
    .url("Format link tidak valid")
    .nullable(),
});
