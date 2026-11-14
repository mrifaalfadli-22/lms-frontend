// src/components/admin/TambahJadwalModal.jsx
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { jadwalSchema } from "../../schemas/jadwalSchema";
import jadwalService from "../../services/jadwalService";
import SearchableSelect from "../ui/SearchableSelect";
import { Loader2 } from "lucide-react";

export default function TambahJadwalModal({ isOpen, onClose, onSuccess }) {
  const [submitError, setSubmitError] = useState(null);
  const [mkOptions, setMkOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [dosenOptions, setDosenOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [mk, kelas, dosen] = await Promise.all([
          jadwalService.getMataKuliahOptions(),
          jadwalService.getKelasOptions(),
          jadwalService.getDosenOptions(),
        ]);
        setMkOptions(mk);
        setKelasOptions(kelas);
        setDosenOptions(dosen);
      } catch (err) {
        console.error("Gagal memuat data dropdown:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [isOpen]);

  const formik = useFormik({
    initialValues: {
      id_mk: "",
      id_kelas: "",
      id_dosen: "",
      // Diisi manual
      jumlah_sesi: "",
      tanggal_mulai: "",
      waktu_mulai: "",
      waktu_berakhir: "",
    },
    validationSchema: jadwalSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError(null);
      try {
        const payload = {
          id_mk: values.id_mk,
          id_kelas: values.id_kelas,
          id_dosen: values.id_dosen,
          jumlah_sesi: Number(values.jumlah_sesi),
          tanggal_mulai: values.tanggal_mulai,
          waktu_mulai: values.waktu_mulai,
          waktu_berakhir: values.waktu_berakhir,
        };
        await onSuccess(payload);
        formik.resetForm();
        onClose();
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Gagal menyimpan data jadwal.";
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ✅ Early return SETELAH semua hooks
  if (!isOpen) return null;

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[540px] shadow-xl overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Tambah Jadwal Kursus
          </h3>
        </div>

        <div className="overflow-y-auto max-h-[80vh]">
          {loadingOptions ? (
            <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[13px]">Memuat data pilihan...</span>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <div className="px-7 pt-6 pb-4 flex flex-col gap-0">
                {/* Kursus */}
                <SearchableSelect
                  label="Kursus"
                  name="id_mk"
                  value={formik.values.id_mk}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("id_mk", true)}
                  options={mkOptions}
                  placeholder="Pilih Kursus"
                  error={formik.errors.id_mk}
                  touched={formik.touched.id_mk}
                  disabled={formik.isSubmitting}
                />

                {/* Kelas */}
                <SearchableSelect
                  label="Kelas"
                  name="id_kelas"
                  value={formik.values.id_kelas}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("id_kelas", true)}
                  options={kelasOptions}
                  placeholder="Pilih Kelas"
                  error={formik.errors.id_kelas}
                  touched={formik.touched.id_kelas}
                  disabled={formik.isSubmitting}
                />

                {/* Pengajar */}
                <SearchableSelect
                  label="Pengajar"
                  name="id_dosen"
                  value={formik.values.id_dosen}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("id_dosen", true)}
                  options={dosenOptions}
                  placeholder="Pilih Pengajar"
                  error={formik.errors.id_dosen}
                  touched={formik.touched.id_dosen}
                  disabled={formik.isSubmitting}
                />

                {/* Hari & Tanggal Mulai */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                      Jumlah Sesi
                    </label>
                    <input
                      type="number"
                      name="jumlah_sesi"
                      value={formik.values.jumlah_sesi}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={formik.isSubmitting}
                      placeholder="Contoh: 8"
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all disabled:opacity-50"
                    />
                    {formik.touched.jumlah_sesi &&
                      formik.errors.jumlah_sesi && (
                        <p className="text-red-500 text-[11px] mt-1 leading-tight">
                          {formik.errors.jumlah_sesi}
                        </p>
                      )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      name="tanggal_mulai"
                      value={formik.values.tanggal_mulai}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={formik.isSubmitting}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all disabled:opacity-50"
                    />
                    {formik.touched.tanggal_mulai &&
                      formik.errors.tanggal_mulai && (
                        <p className="text-red-500 text-[11px] mt-1 leading-tight">
                          {formik.errors.tanggal_mulai}
                        </p>
                      )}
                  </div>
                </div>

                {/* Waktu Mulai & Berakhir */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                      Waktu Mulai
                    </label>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formik.values.waktu_mulai}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={formik.isSubmitting}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all disabled:opacity-50"
                    />
                    {formik.touched.waktu_mulai &&
                      formik.errors.waktu_mulai && (
                        <p className="text-red-500 text-[11px] mt-1 leading-tight">
                          {formik.errors.waktu_mulai}
                        </p>
                      )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
                      Waktu Berakhir
                    </label>
                    <input
                      type="time"
                      name="waktu_berakhir"
                      value={formik.values.waktu_berakhir}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={formik.isSubmitting}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all disabled:opacity-50"
                    />
                    {formik.touched.waktu_berakhir &&
                      formik.errors.waktu_berakhir && (
                        <p className="text-red-500 text-[11px] mt-1 leading-tight">
                          {formik.errors.waktu_berakhir}
                        </p>
                      )}
                  </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
