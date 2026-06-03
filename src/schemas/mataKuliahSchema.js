import * as Yup from "yup";

export const mataKuliahSchema = Yup.object().shape({
  kode_mk: Yup.string()
    .max(10, "Kode MK maksimal 10 karakter")
    .required("Kode mata kuliah wajib diisi"),
  nama_mk: Yup.string()
    .min(3, "Nama terlalu pendek")
    .max(100, "Nama maksimal 100 karakter")
    .required("Nama mata kuliah wajib diisi"),
  sks: Yup.number()
    .min(1, "SKS minimal 1")
    .max(8, "SKS maksimal 8")
    .required("SKS wajib diisi"),
  deskripsi: Yup.string().nullable(),
  fakultas: Yup.string().required("Fakultas wajib dipilih"),
  prodi: Yup.string().required("Program studi wajib dipilih"),
  semester: Yup.number()
    .min(1, "Semester minimal 1")
    .max(14, "Semester maksimal 14")
    .required("Semester wajib dipilih"),
});

export const mataKuliahEditSchema = mataKuliahSchema;
