import * as Yup from "yup";

export const dosenEditSchema = Yup.object().shape({
  nama_lengkap: Yup.string()
    .min(3, "Nama terlalu pendek")
    .required("Nama lengkap wajib diisi"),
  nomor_induk: Yup.string()
    .matches(/^[0-9]+$/, "NIDN harus berupa angka")
    .min(8, "NIDN minimal 8 digit")
    .required("NIDN wajib diisi"),
  fakultas: Yup.string().required("Fakultas wajib dipilih"),
  prodi: Yup.string().required("Program studi wajib dipilih"),
  status_aktif: Yup.boolean().required("Status wajib dipilih"),
});
