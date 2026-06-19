import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { tugasSchema } from "../../schemas/tugasSchema";
import { X } from "lucide-react";
import Input from "../ui/Input";
import ConfirmSaveModal from "../admin/ConfirmSaveModal";

export default function TugasModal({ isOpen, onClose, editData }) {
  if (!isOpen) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      judul: editData?.judul || "",
      tautan: editData?.tautan || "",
      token: editData?.token || "",
      batasWaktu: editData?.batasWaktu || "",
    },
    validationSchema: tugasSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      setShowConfirm(true);
      setSubmitting(false);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setShowConfirm(false);
    onClose();
  };

  const handleConfirmSave = async () => {
    setConfirmLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // Implement API call logic here
      handleClose();
    } catch (err) {
      console.error(err);
      setShowConfirm(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <ConfirmSaveModal
        isOpen={showConfirm}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
        loading={confirmLoading}
        title={editData ? "Simpan Perubahan Tugas?" : "Tambah Tugas Baru?"}
        description={editData ? "Apakah Anda yakin ingin menyimpan perubahan pada tugas ini?" : "Apakah Anda yakin ingin menambahkan tugas baru ini?"}
      />

      <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-7 py-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            {editData ? "Ubah Tugas" : "Tambah Tugas Baru"}
          </h3>
        </div>

        <div className="overflow-y-auto flex-1 p-7 flex flex-col gap-2">
          <Input
            label="Judul Tugas"
            name="judul"
            placeholder="Masukkan judul tugas"
            value={formik.values.judul}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.judul}
            touched={formik.touched.judul}
          />

          <Input
            label="Tautan CBT"
            name="tautan"
            placeholder="https://u-talent.uika-bogor.ac.id/cbt/"
            value={formik.values.tautan}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.tautan}
            touched={formik.touched.tautan}
          />

          <Input
            label="Token CBT"
            name="token"
            placeholder="Masukkan token CBT"
            value={formik.values.token}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.token}
            touched={formik.touched.token}
          />

          <Input
            label="Batas Waktu Pengumpulan"
            name="batasWaktu"
            type="datetime-local"
            value={formik.values.batasWaktu}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.batasWaktu}
            touched={formik.touched.batasWaktu}
          />
        </div>

        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={formik.isSubmitting || confirmLoading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting || confirmLoading}
            className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {editData ? "Simpan Perubahan" : "Tambah Tugas"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
