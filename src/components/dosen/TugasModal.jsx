import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { tugasSchema } from "../../schemas/tugasSchema";
import { X } from "lucide-react";
import Input from "../ui/Input";
import ConfirmSaveModal from "../admin/ConfirmSaveModal";

import tugasService from "../../services/tugasService";

export default function TugasModal({ isOpen, onClose, editData, pertemuanId, onSaveSuccess }) {
  if (!isOpen) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      judul: editData?.judul || "",
      deskripsi: editData?.deskripsi || "",
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
      const payload = {
        judul_tugas: formik.values.judul,
        deskripsi_tugas: formik.values.deskripsi,
        link_cbt: formik.values.tautan,
        token_cbt: formik.values.token,
        batas_waktu: formik.values.batasWaktu,
      };

      if (editData) {
        await tugasService.update(editData.id, payload);
      } else {
        await tugasService.create(pertemuanId, payload);
      }

      if (onSaveSuccess) onSaveSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422 && err.response.data?.errors) {
        const errors = err.response.data.errors;
        const formikErrors = {};
        if (errors.judul_tugas) formikErrors.judul = errors.judul_tugas[0];
        if (errors.deskripsi_tugas) formikErrors.deskripsi = errors.deskripsi_tugas[0];
        if (errors.link_cbt) formikErrors.tautan = errors.link_cbt[0];
        if (errors.token_cbt) formikErrors.token = errors.token_cbt[0];
        if (errors.batas_waktu) formikErrors.batasWaktu = errors.batas_waktu[0];
        formik.setErrors(formikErrors);
      } else {
        alert(err.response?.data?.message || err.message);
      }
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

          <div className="w-full text-left">
            <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight">
              Deskripsi Tugas
            </label>
            <div className="relative">
              <textarea
                name="deskripsi"
                placeholder="Masukkan deskripsi tugas"
                value={formik.values.deskripsi}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={3}
                className={`
                  w-full mt-1.5 px-4 py-3 
                  bg-white 
                  border border-gray-300
                  rounded-lg 
                  text-sm text-gray-700
                  placeholder-gray-400/80
                  outline-none
                  transition-all duration-200
                  focus:bg-white
                  focus:ring-2 focus:ring-[#0E5C46]
                  resize-none
                  ${formik.errors.deskripsi && formik.touched.deskripsi ? "ring-2 ring-red-400 bg-white" : ""}
                `}
              />
            </div>
            <div className="h-5 mt-1 ml-1">
              {formik.errors.deskripsi && formik.touched.deskripsi && (
                <p className="text-red-500 text-[11px] font-medium animate-fadeIn">
                  {formik.errors.deskripsi}
                </p>
              )}
            </div>
          </div>

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
