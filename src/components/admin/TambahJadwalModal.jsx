// src/components/admin/TambahJadwalModal.jsx
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  jadwalSchema,
  HARI_OPTIONS,
  TAHUN_AJARAN_OPTIONS,
} from "../../schemas/jadwalSchema";
import jadwalService from "../../services/jadwalService";
import SearchableSelect from "../ui/SearchableSelect";
import { Loader2 } from "lucide-react";

const SEMESTER_OPTIONS = Array.from({ length: 14 }, (_, i) => ({
  value: String(i + 1),
  label: `Semester ${i + 1}`,
}));

// Field read-only untuk menampilkan info dari mata kuliah yang dipilih
const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-[13px] font-semibold text-[#1E293B] mb-1.5">
      {label}
    </label>
    <div className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] bg-[#F8FAFC] text-[#64748B] min-h-[42px]">
      {value || (
        <span className="text-[#CBD5E1] italic">
          Pilih mata kuliah terlebih dahulu
        </span>
      )}
    </div>
  </div>
);

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
      // Diisi otomatis dari master mata kuliah — tidak diedit user
      fakultas: "",
      prodi: "",
      semester: "",
      sks: "",
      // Diisi manual
      tahun: "",
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
          tahun: values.tahun,
          semester: Number(values.semester),
          jumlah_sesi: Number(values.jumlah_sesi),
          tanggal_mulai: values.tanggal_mulai,
          waktu_mulai: values.waktu_mulai,
          waktu_berakhir: values.waktu_berakhir,
          ...(values.fakultas ? { fakultas: values.fakultas } : {}),
          ...(values.prodi ? { prodi: values.prodi } : {}),
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

  // Auto-fill dari master mata kuliah saat dipilih
  const handleMkChange = (e) => {
    const selectedId = e.target.value;
    formik.setFieldValue("id_mk", selectedId);

    const mk = mkOptions.find((m) => m.value === selectedId);
    if (mk) {
      formik.setFieldValue("semester", mk.semester ? String(mk.semester) : "");
      formik.setFieldValue("sks", mk.sks ? String(mk.sks) : "");
      formik.setFieldValue("fakultas", mk.fakultas || "");
      formik.setFieldValue("prodi", mk.prodi || "");
    } else {
      formik.setFieldValue("semester", "");
      formik.setFieldValue("sks", "");
      formik.setFieldValue("fakultas", "");
      formik.setFieldValue("prodi", "");
    }
  };

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
            Tambah Jadwal Kuliah
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
                {/* Mata Kuliah — trigger auto-fill */}
                <SearchableSelect
                  label="Mata Kuliah"
                  name="id_mk"
                  value={formik.values.id_mk}
                  onChange={handleMkChange}
                  onBlur={() => formik.setFieldTouched("id_mk", true)}
                  options={mkOptions}
                  placeholder="Pilih Mata Kuliah"
                  error={formik.errors.id_mk}
                  touched={formik.touched.id_mk}
                  disabled={formik.isSubmitting}
                />

                {/* Read-only fields dari master mata kuliah — 2 kolom */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <ReadOnlyField
                      label="Fakultas"
                      value={formik.values.fakultas}
                    />
                  </div>
                  <div className="flex-1">
                    <ReadOnlyField
                      label="Program Studi"
                      value={formik.values.prodi}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <ReadOnlyField
                      label="Semester"
                      value={
                        formik.values.semester
                          ? `Semester ${formik.values.semester}`
                          : ""
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <ReadOnlyField
                      label="SKS"
                      value={
                        formik.values.sks ? `${formik.values.sks} SKS` : ""
                      }
                    />
                  </div>
                </div>

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

                {/* Dosen Pengampu */}
                <SearchableSelect
                  label="Dosen Pengampu"
                  name="id_dosen"
                  value={formik.values.id_dosen}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("id_dosen", true)}
                  options={dosenOptions}
                  placeholder="Pilih Dosen Pengampu"
                  error={formik.errors.id_dosen}
                  touched={formik.touched.id_dosen}
                  disabled={formik.isSubmitting}
                />

                {/* Tahun Ajaran */}
                <SearchableSelect
                  label="Tahun Ajaran"
                  name="tahun"
                  value={formik.values.tahun}
                  onChange={formik.handleChange}
                  onBlur={() => formik.setFieldTouched("tahun", true)}
                  options={TAHUN_AJARAN_OPTIONS}
                  placeholder="Pilih Tahun Ajaran"
                  error={formik.errors.tahun}
                  touched={formik.touched.tahun}
                  disabled={formik.isSubmitting}
                  searchable={false}
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
