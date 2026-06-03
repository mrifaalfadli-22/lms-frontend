// components/admin/UbahMahasiswaModal.jsx
import { useState } from "react";
import { useFormik } from "formik";
import { fakultasData } from "../../data/fakultasData";
import { mahasiswaEditSchema } from "../../schemas/mahasiswaSchema";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";
import ConfirmSaveModal from "./ConfirmSaveModal";

export default function UbahMahasiswaModal({
  isOpen,
  onClose,
  onSuccess,
  data,
}) {
  if (!isOpen || !data) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      nama_lengkap: data.nama_lengkap || "",
      nomor_induk: data.nomor_induk || "",
      fakultas: data.fakultas || "",
      prodi: data.prodi || "",
      angkatan: data.angkatan || "",
      status_aktif: data.status_aktif ?? true,
    },
    validationSchema: mahasiswaEditSchema,
    enableReinitialize: true,
    onSubmit: async () => {
      // Saat form valid, tampilkan modal konfirmasi — jangan simpan dulu
      setShowConfirm(true);
    },
  });

  const handleConfirmSave = async () => {
    setConfirmLoading(true);
    try {
      await onSuccess(data.id_user, formik.values);
      setShowConfirm(false);
      onClose();
    } catch {
      // error ditangani di parent
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
        description={`Data mahasiswa ${data.nama_lengkap} akan diperbarui. Apakah Anda yakin ingin menyimpan perubahan ini?`}
      />

      {/* Modal form utama */}
      <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
            <h3 className="text-[17px] font-bold text-[#1E293B]">
              Ubah Data Mahasiswa
            </h3>
          </div>

          <div className="overflow-y-auto max-h-[80vh]">
            <form onSubmit={formik.handleSubmit} id="ubah-mahasiswa-form">
              <div className="px-7 pt-6 pb-4 flex flex-col gap-0">
                <Input
                  label="Nama Lengkap"
                  name="nama_lengkap"
                  placeholder="Masukkan nama lengkap"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nama_lengkap}
                  error={formik.errors.nama_lengkap}
                  touched={formik.touched.nama_lengkap}
                  disabled={formik.isSubmitting}
                />
                <Input
                  label="NPM (Nomor Pokok Mahasiswa)"
                  name="nomor_induk"
                  placeholder="Contoh: 2210631170001"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.nomor_induk}
                  error={formik.errors.nomor_induk}
                  touched={formik.touched.nomor_induk}
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
                <Input
                  label="Angkatan"
                  name="angkatan"
                  placeholder="Contoh: 2024"
                  maxLength={4}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.angkatan}
                  error={formik.errors.angkatan}
                  touched={formik.touched.angkatan}
                  disabled={formik.isSubmitting}
                />
                <SearchableSelect
                  label="Status Akun"
                  name="status_aktif"
                  value={formik.values.status_aktif === true ? "true" : "false"}
                  onChange={(e) =>
                    formik.setFieldValue(
                      "status_aktif",
                      e.target.value === "true",
                    )
                  }
                  onBlur={() => formik.setFieldTouched("status_aktif", true)}
                  options={[
                    { value: "true", label: "Aktif" },
                    { value: "false", label: "Nonaktif" },
                  ]}
                  placeholder="Pilih Status"
                  error={formik.errors.status_aktif}
                  touched={formik.touched.status_aktif}
                  disabled={formik.isSubmitting}
                  searchable={false}
                />
              </div>

              {/* Footer */}
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
