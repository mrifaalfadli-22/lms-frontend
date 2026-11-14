import { useState } from "react";
import { useFormik } from "formik";
import { kelasEditSchema } from "../../schemas/kelasSchema";
import Input from "../ui/Input";
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
