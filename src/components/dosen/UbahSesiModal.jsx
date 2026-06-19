import { useState } from "react";
import { useFormik } from "formik";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import ConfirmSaveModal from "../admin/ConfirmSaveModal";

export default function UbahSesiModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Opsi Metode Pertemuan
  const metodeOptions = [
    { value: "Synchronous", label: "Synchronous" },
    { value: "Asynchronous", label: "Asynchronous" },
  ];

  const formik = useFormik({
    initialValues: {
      metode: data.metode || "",
      materi: data.materi || "",
      tautan_cbt: data.tautan_cbt || "",
      tautan_zoom: data.tautan_zoom || "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      // Saat form submit, tampilkan modal konfirmasi
      setShowConfirm(true);
      setSubmitting(false);
    },
  });

  const handleConfirmSave = async () => {
    setConfirmLoading(true);
    try {
      // Simulasi delay penyimpanan API
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update data dummy sementara (karena masih dummy)
      data.metode = formik.values.metode;
      data.materi = formik.values.materi;

      setShowConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <>
      <ConfirmSaveModal
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSave}
        loading={confirmLoading}
        title="Ubah Sesi Pertemuan"
        description="Apakah Anda yakin ingin menyimpan perubahan pada sesi ini?"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-[17px] font-extrabold text-[#1E293B]">
              Ubah Sesi Pertemuan
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto custom-scrollbar">
            <form onSubmit={formik.handleSubmit} className="flex flex-col">
              <div className="p-7 space-y-5">
                <SearchableSelect
                  label="Metode Pertemuan"
                  name="metode"
                  options={metodeOptions}
                  value={formik.values.metode}
                  onChange={(e) => formik.setFieldValue("metode", e.target.value)}
                  onBlur={() => formik.setFieldTouched("metode", true)}
                  error={formik.touched.metode && formik.errors.metode}
                  placeholder="Pilih metode"
                />
                <Input
                  label="Materi Pembahasan"
                  name="materi"
                  placeholder="Contoh: Pengenalan dasar..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.materi}
                  disabled={formik.isSubmitting}
                />
                <Input
                  label="Tautan CBT (Opsional)"
                  name="tautan_cbt"
                  placeholder="https://cbt.uika.ac.id/..."
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tautan_cbt}
                  disabled={formik.isSubmitting}
                />
                <Input
                  label="Tautan Zoom/Gmeet"
                  name="tautan_zoom"
                  placeholder={formik.values.metode === "Asynchronous" ? "Tidak diperlukan untuk Asynchronous" : "https://zoom.us/..."}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tautan_zoom}
                  disabled={formik.isSubmitting || formik.values.metode === "Asynchronous"}
                />
              </div>

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
