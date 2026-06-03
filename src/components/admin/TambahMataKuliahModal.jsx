import { useState } from "react";
import { useFormik } from "formik";
import { fakultasData } from "../../data/fakultasData";
import { mataKuliahSchema } from "../../schemas/mataKuliahSchema";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";

export default function TambahMataKuliahModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    initialValues: {
      kode_mk: "",
      nama_mk: "",
      fakultas: "",
      prodi: "",
      semester: "",
      sks: "",
      deskripsi: "",
    },
    validationSchema: mataKuliahSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError(null);
      try {
        await onSuccess(values);
        formik.resetForm();
        onClose();
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Gagal menyimpan data mata kuliah.";
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedFakultas = fakultasData.find(
    (f) => f.value === formik.values.fakultas,
  );
  const prodiOptions = selectedFakultas?.prodi || [];

  const handleFakultasChange = (e) => {
    formik.setFieldValue("fakultas", e.target.value);
    formik.setFieldValue("prodi", "");
  };

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Tambah Mata Kuliah
          </h3>
        </div>

        <div className="overflow-y-auto max-h-[80vh]">
          <form onSubmit={formik.handleSubmit} id="tambah-mk-form">
            <div className="px-7 pt-6 pb-4 flex flex-col gap-0">
              <Input
                label="Kode Mata Kuliah"
                name="kode_mk"
                placeholder="Contoh: IF101"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.kode_mk}
                error={formik.errors.kode_mk}
                touched={formik.touched.kode_mk}
                disabled={formik.isSubmitting}
              />
              <Input
                label="Nama Mata Kuliah"
                name="nama_mk"
                placeholder="Contoh: Algoritma dan Pemrograman"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nama_mk}
                error={formik.errors.nama_mk}
                touched={formik.touched.nama_mk}
                disabled={formik.isSubmitting}
              />
              <SearchableSelect
                label="Fakultas"
                name="fakultas"
                value={formik.values.fakultas}
                onChange={handleFakultasChange}
                onBlur={() => formik.setFieldTouched("fakultas", true)}
                options={fakultasData}
                placeholder="Pilih Fakultas"
                error={formik.errors.fakultas}
                touched={formik.touched.fakultas}
                disabled={formik.isSubmitting}
              />
              <SearchableSelect
                label="Program Studi"
                name="prodi"
                value={formik.values.prodi}
                onChange={formik.handleChange}
                onBlur={() => formik.setFieldTouched("prodi", true)}
                options={prodiOptions}
                placeholder="Pilih Program Studi"
                disabled={!formik.values.fakultas || formik.isSubmitting}
                disabledMessage={
                  !formik.values.fakultas
                    ? "Pilih fakultas terlebih dahulu"
                    : ""
                }
                error={formik.errors.prodi}
                touched={formik.touched.prodi}
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <SearchableSelect
                    label="Semester"
                    name="semester"
                    value={formik.values.semester}
                    onChange={formik.handleChange}
                    onBlur={() => formik.setFieldTouched("semester", true)}
                    options={Array.from({ length: 14 }, (_, i) => ({
                      value: String(i + 1),
                      label: `Semester ${i + 1}`,
                    }))}
                    placeholder="Pilih Semester"
                    error={formik.errors.semester}
                    touched={formik.touched.semester}
                    disabled={formik.isSubmitting}
                    searchable={false}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="SKS"
                    name="sks"
                    type="number"
                    placeholder="Contoh: 3"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sks}
                    error={formik.errors.sks}
                    touched={formik.touched.sks}
                    disabled={formik.isSubmitting}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                  Deskripsi{" "}
                  <span className="text-[#94A3B8] font-normal">(opsional)</span>
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Tuliskan deskripsi singkat mata kuliah ini..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.deskripsi}
                  disabled={formik.isSubmitting}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all resize-none disabled:opacity-50"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-[13px] text-center px-7 pb-3">
                {submitError}
              </p>
            )}

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
                className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {formik.isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
