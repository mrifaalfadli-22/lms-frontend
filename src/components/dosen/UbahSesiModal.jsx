import { useState } from "react";
import { useFormik } from "formik";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import ConfirmSaveModal from "../admin/ConfirmSaveModal";
import sesiPertemuanService from "../../services/sesiPertemuanService";

export default function UbahSesiModal({ isOpen, onClose, onSaveSuccess, data }) {
  if (!isOpen || !data) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Opsi Metode Pertemuan
  const metodeOptions = [
    { value: "Synchronous", label: "Synchronous" },
    { value: "Asynchronous", label: "Asynchronous" },
  ];

  // Opsi Status
  const statusOptions = [
    { value: "TERJADWAL", label: "Terjadwal" },
    { value: "BERJALAN", label: "Berjalan" },
    { value: "SELESAI", label: "Selesai" },
  ];

  const formatDateToLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString.substring(0, 10);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formik = useFormik({
    initialValues: {
      status: data.status || "TERJADWAL",
      metode: data.metode_pertemuan === "-" ? "Asynchronous" : (data.metode_pertemuan || "Asynchronous"),
      tanggal_pelaksanaan: data.tanggal_pelaksanaan ? formatDateToLocal(data.tanggal_pelaksanaan) : "",
      materi: data.materi !== "-" ? data.materi : "",
      tautan_zoom: data.link_kelas_daring || "",
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
    setErrorMsg(null);
    try {
      const payload = {
        pertemuan_ke: data.pertemuan_ke,
        judul_sesi: data.judul_sesi,
        jam_mulai: data.jam_mulai ? data.jam_mulai.substring(0, 5) : "00:00",
        jam_berakhir: data.jam_berakhir ? data.jam_berakhir.substring(0, 5) : "00:00",
        tanggal_pelaksanaan: formik.values.tanggal_pelaksanaan,
        metode_pertemuan: formik.values.metode.toLowerCase(),
        status: formik.values.status,
        materi: formik.values.materi,
        link_kelas_daring: formik.values.metode === "Synchronous" ? formik.values.tautan_zoom : null,
      };

      const res = await sesiPertemuanService.update(data.id_sesi, payload);

      setShowConfirm(false);
      onSaveSuccess(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan perubahan. Silakan coba lagi.");
      setShowConfirm(false);
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

          {errorMsg && (
            <div className="mx-7 mt-5 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[13px] font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form Content */}
          <div className="overflow-y-auto custom-scrollbar">
            <form onSubmit={formik.handleSubmit} className="flex flex-col">
              <div className="p-7 space-y-5">
                <SearchableSelect
                  label="Status Pertemuan"
                  name="status"
                  options={statusOptions}
                  value={formik.values.status}
                  onChange={(e) => formik.setFieldValue("status", e.target.value)}
                  onBlur={() => formik.setFieldTouched("status", true)}
                  error={formik.touched.status && formik.errors.status}
                  placeholder="Pilih status"
                />

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
                  label="Tanggal Pelaksanaan"
                  type="date"
                  name="tanggal_pelaksanaan"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tanggal_pelaksanaan}
                  disabled={formik.isSubmitting}
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
