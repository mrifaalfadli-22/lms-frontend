// src/schemas/jadwalSchema.js
import * as yup from "yup";

export const HARI_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

// Generate opsi tahun ajaran: "2024/2025", "2025/2026", dst
export const TAHUN_AJARAN_OPTIONS = Array.from({ length: 7 }, (_, i) => {
  const start = new Date().getFullYear() - 2 + i;
  const label = `${start}/${start + 1}`;
  return { value: label, label };
});

export const jadwalSchema = yup.object({
  id_mk: yup
    .string()
    .required("Mata kuliah wajib dipilih.")
    .test("not-empty", "Mata kuliah wajib dipilih.", (val) => !!val),

  id_kelas: yup
    .string()
    .required("Kelas wajib dipilih.")
    .test("not-empty", "Kelas wajib dipilih.", (val) => !!val),

  id_dosen: yup
    .string()
    .required("Dosen wajib dipilih.")
    .test("not-empty", "Dosen wajib dipilih.", (val) => !!val),

  // Diisi otomatis dari relasi mata kuliah, tetap wajib dikirim ke BE
  fakultas: yup.string().notRequired(),
  prodi: yup.string().notRequired(),

  // Tahun ajaran format "2025/2026"
  tahun: yup
    .string()
    .required("Tahun ajaran wajib dipilih.")
    .matches(/^\d{4}\/\d{4}$/, "Format tahun ajaran tidak valid."),

  // Semester urutan integer 1-14
  semester: yup
    .number()
    .typeError("Semester harus berupa angka.")
    .integer("Semester harus bilangan bulat.")
    .min(1, "Semester minimal 1.")
    .max(14, "Semester maksimal 14.")
    .required("Semester wajib diisi."),

  hari: yup
    .string()
    .oneOf(HARI_OPTIONS, "Hari tidak valid.")
    .required("Hari wajib dipilih."),

  waktu_mulai: yup
    .string()
    .required("Waktu mulai wajib diisi.")
    .test(
      "format-waktu",
      "Format waktu mulai tidak valid (HH:mm).",
      (val) => !val || /^([01]\d|2[0-3]):[0-5]\d$/.test(val),
    ),

  waktu_berakhir: yup
    .string()
    .required("Waktu berakhir wajib diisi.")
    .test(
      "format-waktu",
      "Format waktu berakhir tidak valid (HH:mm).",
      (val) => !val || /^([01]\d|2[0-3]):[0-5]\d$/.test(val),
    )
    .test(
      "is-after-start",
      "Waktu berakhir harus setelah waktu mulai.",
      function (waktu_berakhir) {
        const { waktu_mulai } = this.parent;
        if (!waktu_mulai || !waktu_berakhir) return true;
        return waktu_berakhir > waktu_mulai;
      },
    ),
});
