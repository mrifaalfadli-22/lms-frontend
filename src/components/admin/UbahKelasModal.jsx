import { useState } from "react";
import { useFormik } from "formik";
import { kelasEditSchema } from "../../schemas/kelasSchema";
import { fakultasData } from "../../data/fakultasData";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import ConfirmSaveModal from "./ConfirmSaveModal";

export default function UbahKelasModal({ isOpen, onClose, onSuccess, data }) {
  if (!isOpen || !data) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const formik = useFormik({
    initialValues: {
      nama_kelas: data.nama_kelas || "",
      kode_kelas: data.kode_kelas || "",
      tahun_angkatan: data.tahun_angkatan || "",
      fakultas: data.fakultas || "",
      prodi: data.prodi || "",
    },
    validationSchema: kelasEditSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Saat form valid, tampilkan modal konfirmasi — jangan simpan dulu
      setSubmitError(null);
      setShowConfirm(true);
      setSubmitting(false);
    },
  });

  const handleConfirmSave = async () => {
    setConfirmLoading(true);
    setSubmitError(null);
    try {
      await onSuccess(data.id_kelas, {
        nama_kelas: formik.values.nama_kelas,
        kode_kelas: formik.values.kode_kelas,
        tahun_angkatan: formik.values.tahun_angkatan,
        fakultas: formik.values.fakultas || null,
        prodi: formik.values.prodi || null,
      });
      setShowConfirm(false);
      onClose();
    } catch (err) {
      setShowConfirm(false);
      const msg = err?.response?.data?.message || "Gagal menyimpan data kelas.";
      setSubmitError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

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
    setShowConfirm(false);
    setSubmitError(null);
    onClose();
  };

  return (
    <>
      {/* Modal konfirmasi simpan */}
      <ConfirmSaveModal
        isOpen={showConfirm}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
        loading={confirmLoading}
        title="Simpan Perubahan?"
        description={`Data kelas ${data.nama_kelas} akan diperbarui. Apakah Anda yakin ingin menyimpan perubahan ini?`}
      />

      {/* Modal form utama */}
      <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-100">
            <h3 className="text-[17px] font-bold text-[#1E293B]">Ubah Kelas</h3>
          </div>

          <div className="overflow-y-auto max-h-[80vh]">
            <form onSubmit={formik.handleSubmit} id="ubah-kelas-form">
              <div className="px-7 pt-6 pb-4 flex flex-col gap-0">
                <Input
                  label="Nama Kelas"
                  name="nama_kelas"
                  placeholder="Contoh: Kelas A"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nama_kelas}
                  error={formik.errors.nama_kelas}
                  touched={formik.touched.nama_kelas}
                  disabled={formik.isSubmitting}
                />
                <Input
                  label="Kode Kelas"
                  name="kode_kelas"
                  placeholder="Contoh: KLS-A"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.kode_kelas}
                  error={formik.errors.kode_kelas}
                  touched={formik.touched.kode_kelas}
                  disabled={formik.isSubmitting}
                />
                <Input
                  label="Tahun Angkatan"
                  name="tahun_angkatan"
                  placeholder="Contoh: 2024"
                  maxLength={4}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tahun_angkatan}
                  error={formik.errors.tahun_angkatan}
                  touched={formik.touched.tahun_angkatan}
                  disabled={formik.isSubmitting}
                />
                <SearchableSelect
                  label="Fakultas"
                  name="fakultas"
                  value={formik.values.fakultas}
                  onChange={handleFakultasChange}
                  onBlur={() => formik.setFieldTouched("fakultas", true)}
                  options={fakultasData}
                  placeholder="Pilih Fakultas (opsional)"
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
                  placeholder="Pilih Program Studi (opsional)"
                  disabled={!formik.values.fakultas || formik.isSubmitting}
                  disabledMessage={
                    !formik.values.fakultas
                      ? "Pilih fakultas terlebih dahulu"
                      : ""
                  }
                  error={formik.errors.prodi}
                  touched={formik.touched.prodi}
                />
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
                  disabled={formik.isSubmitting || confirmLoading}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting || confirmLoading}
                  className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
