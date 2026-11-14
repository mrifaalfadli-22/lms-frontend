// src/schemas/jadwalSchema.js
import * as yup from "yup";

export const HARI_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const jadwalSchema = yup.object({
  id_mk: yup
    .string()
    .required("Kursus wajib dipilih.")
    .test("not-empty", "Kursus wajib dipilih.", (val) => !!val),

  id_kelas: yup
    .string()
    .required("Kelas wajib dipilih.")
    .test("not-empty", "Kelas wajib dipilih.", (val) => !!val),

  id_dosen: yup
    .string()
    .required("Pengajar wajib dipilih.")
    .test("not-empty", "Pengajar wajib dipilih.", (val) => !!val),

  jumlah_sesi: yup
    .number()
    .typeError("Jumlah sesi harus berupa angka.")
    .integer("Jumlah sesi harus bilangan bulat.")
    .min(1, "Minimal 1 sesi.")
    .required("Jumlah sesi wajib diisi."),

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

  tanggal_mulai: yup
    .date()
    .typeError("Format tanggal mulai tidak valid.")
    .required("Tanggal mulai wajib diisi."),
});
