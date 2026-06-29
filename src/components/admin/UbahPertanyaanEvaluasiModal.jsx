import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, HelpCircle, ListOrdered } from "lucide-react";

const KATEGORI_OPTIONS = [
  { value: "Kinerja Dosen", label: "Kinerja Dosen" },
  { value: "Kualitas Pembelajaran", label: "Kualitas Pembelajaran" },
  { value: "Lainnya", label: "Lainnya (Kustom)" },
];

const PREDEFINED_CATEGORIES = ["Kinerja Dosen", "Kualitas Pembelajaran"];

const validationSchema = Yup.object({
  kategori: Yup.string().required("Kategori wajib diisi"),
  kategori_kustom: Yup.string().when("kategori", {
    is: "Lainnya",
    then: (schema) =>
      schema.required("Nama kategori kustom wajib diisi").max(50, "Maksimal 50 karakter"),
    otherwise: (schema) => schema.notRequired(),
  }),
  tipe_pertanyaan: Yup.string().required("Tipe pertanyaan wajib diisi"),
  teks_pertanyaan: Yup.string()
    .required("Teks pertanyaan wajib diisi")
    .min(10, "Pertanyaan terlalu singkat (min 10 karakter)"),
  urutan: Yup.number()
    .required("Urutan wajib diisi")
    .min(1, "Urutan minimal 1")
    .integer("Urutan harus bilangan bulat"),
  is_aktif: Yup.boolean(),
});

export default function UbahPertanyaanEvaluasiModal({ isOpen, onClose, onSuccess, data }) {
  if (!isOpen || !data) return null;

  const [submitError, setSubmitError] = useState(null);

  // Deteksi apakah kategori asal adalah kustom (bukan salah satu dari predefined)
  const isKustom = data.kategori && !PREDEFINED_CATEGORIES.includes(data.kategori);

  const formik = useFormik({
    initialValues: {
      kategori: isKustom ? "Lainnya" : (data.kategori || ""),
      kategori_kustom: isKustom ? data.kategori : "",
      tipe_pertanyaan: data.tipe_pertanyaan || "skala",
      teks_pertanyaan: data.teks_pertanyaan || "",
      urutan: data.urutan || 1,
      is_aktif: data.is_aktif ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError(null);
      try {
        const kategori =
          values.kategori === "Lainnya" ? values.kategori_kustom.trim() : values.kategori;
        await onSuccess(data.id_pertanyaan, {
          kategori,
          tipe_pertanyaan: values.tipe_pertanyaan,
          teks_pertanyaan: values.teks_pertanyaan,
          urutan: Number(values.urutan),
          is_aktif: values.is_aktif,
        });
        onClose();
      } catch (err) {
        setSubmitError(
          err?.response?.data?.message || "Gagal menyimpan perubahan. Coba lagi."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  const fieldClass = (name) =>
    `w-full px-4 py-2.5 border rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all ${
      formik.touched[name] && formik.errors[name]
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-[#E2E8F0] focus:border-[#167A61]"
    }`;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <HelpCircle size={18} className="text-blue-500" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1E293B]">Ubah Pertanyaan</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={formik.isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[80vh]">
          <form onSubmit={formik.handleSubmit} id="ubah-pertanyaan-form">
            <div className="px-7 pt-6 pb-4 flex flex-col gap-4">
              {/* Kategori */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="kategori"
                  value={formik.values.kategori}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                  className={fieldClass("kategori") + " cursor-pointer"}
                >
                  <option value="">— Pilih Kategori —</option>
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {formik.touched.kategori && formik.errors.kategori && (
                  <p className="text-red-500 text-[12px] mt-1">{formik.errors.kategori}</p>
                )}
              </div>

              {/* Kategori kustom */}
              {formik.values.kategori === "Lainnya" && (
                <div>
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Nama Kategori Kustom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kategori_kustom"
                    value={formik.values.kategori_kustom}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    placeholder="Contoh: Fasilitas Kampus"
                    className={fieldClass("kategori_kustom")}
                    maxLength={50}
                  />
                  {formik.touched.kategori_kustom && formik.errors.kategori_kustom && (
                    <p className="text-red-500 text-[12px] mt-1">
                      {formik.errors.kategori_kustom}
                    </p>
                  )}
                </div>
              )}

              {/* Tipe Pertanyaan */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Tipe Pertanyaan <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input
                      type="radio"
                      name="tipe_pertanyaan"
                      value="skala"
                      checked={formik.values.tipe_pertanyaan === "skala"}
                      onChange={formik.handleChange}
                      disabled={formik.isSubmitting}
                      className="w-4 h-4 text-[#167A61] focus:ring-[#167A61]"
                    />
                    Skala Likert (1-5)
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1E293B] cursor-pointer">
                    <input
                      type="radio"
                      name="tipe_pertanyaan"
                      value="teks"
                      checked={formik.values.tipe_pertanyaan === "teks"}
                      onChange={formik.handleChange}
                      disabled={formik.isSubmitting}
                      className="w-4 h-4 text-[#167A61] focus:ring-[#167A61]"
                    />
                    Teks Bebas / Essay
                  </label>
                </div>
              </div>

              {/* Teks Pertanyaan */}
              <div>
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Teks Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="teks_pertanyaan"
                  rows={3}
                  value={formik.values.teks_pertanyaan}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                  placeholder="Contoh: Seberapa jelas dosen dalam menyampaikan materi?"
                  className={fieldClass("teks_pertanyaan") + " resize-none"}
                />
                {formik.touched.teks_pertanyaan && formik.errors.teks_pertanyaan && (
                  <p className="text-red-500 text-[12px] mt-1">
                    {formik.errors.teks_pertanyaan}
                  </p>
                )}
              </div>

              {/* Urutan & Status */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ListOrdered size={13} />
                      Urutan <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="urutan"
                    min={1}
                    value={formik.values.urutan}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={formik.isSubmitting}
                    className={fieldClass("urutan")}
                  />
                  {formik.touched.urutan && formik.errors.urutan && (
                    <p className="text-red-500 text-[12px] mt-1">{formik.errors.urutan}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                    Status
                  </label>
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 border border-[#E2E8F0] rounded-lg cursor-pointer hover:border-[#167A61] transition-all"
                    onClick={() =>
                      !formik.isSubmitting &&
                      formik.setFieldValue("is_aktif", !formik.values.is_aktif)
                    }
                  >
                    <div
                      className={`w-10 h-5 rounded-full flex items-center transition-all duration-300 px-0.5 ${
                        formik.values.is_aktif ? "bg-[#167A61]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                          formik.values.is_aktif ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span className="text-[13px] font-medium text-[#1E293B]">
                      {formik.values.is_aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-[13px] text-center px-7 pb-2">{submitError}</p>
            )}

            {/* Actions */}
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={handleClose}
                disabled={formik.isSubmitting}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formik.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
