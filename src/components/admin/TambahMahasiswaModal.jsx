import { useFormik } from "formik";
import { fakultasData } from "../../data/fakultasData";
import { mahasiswaSchema } from "../../schemas/mahasiswaSchema";
import Input from "../ui/Input";
import SearchableSelect from "../ui/SearchableSelect";

export default function TambahMahasiswaModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const formik = useFormik({
    initialValues: {
      nama_lengkap: "",
      nomor_induk: "",
      fakultas: "",
      prodi: "",
      angkatan: "",
    },
    validationSchema: mahasiswaSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSuccess({
          ...values,
          status_aktif: true, // otomatis aktif saat ditambah
        });
        formik.resetForm();
        onClose();
      } catch {
        // error dihandle di parent
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Tambah Data Mahasiswa
          </h3>
        </div>

        {/* Form */}
        <div className="px-7 py-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={formik.handleSubmit} id="tambah-mahasiswa-form">
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
                !formik.values.fakultas ? "Pilih fakultas terlebih dahulu" : ""
              }
              error={formik.errors.prodi}
              touched={formik.touched.prodi}
            />

            {/* Angkatan — input biasa */}
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

            {/* Info email otomatis */}
            <div className="bg-[#F0FDF9] border border-[#D1FAE5] rounded-xl px-4 py-3 mt-1">
              <p className="text-[12px] text-[#065F46] leading-relaxed">
                <span className="font-semibold">Info:</span> Email akan otomatis
                dibuat dengan format{" "}
                <span className="font-mono font-semibold">
                  NPM@mhs.uika.ac.id
                </span>{" "}
                dan password default{" "}
                <span className="font-mono font-semibold">MhsNPM</span>.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleClose}
            disabled={formik.isSubmitting}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="tambah-mahasiswa-form"
            disabled={formik.isSubmitting}
            className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {formik.isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
