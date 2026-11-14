import { X } from "lucide-react";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailJadwalModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const waktu =
    data.waktu_mulai && data.waktu_berakhir
      ? `${data.waktu_mulai.substring(0, 5)} – ${data.waktu_berakhir.substring(0, 5)}`
      : "-";

  const rows = [
    { label: "Kursus", value: val(data.nama_mk) },
    { label: "Kode Kursus", value: val(data.kode_mk) },
    { label: "Kelas", value: val(data.kelas) },
    { label: "Kode Kelas", value: val(data.kode_kelas) },
    { label: "Pengajar", value: val(data.nama_dosen) },
    { label: "NIDN", value: val(data.nidn) },
    { label: "Hari", value: val(data.hari) },
    { label: "Waktu", value: waktu },
    { label: "Token Enrollment", value: val(data.token_enrollment) },
  ];

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-[#008B5E] leading-tight">
              Detail Jadwal Kursus
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Informasi lengkap jadwal dan kursus ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {rows.map((row, i) => (
              <div key={i} className="flex flex-col border-b border-gray-100 pb-3">
                <span className="text-[13px] text-[#64748B] mb-1">
                  {row.label}
                </span>
                <span className="text-[14px] font-medium text-[#1E293B]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[#008B5E] text-[#008B5E] hover:bg-[#f0fdf4] text-[13px] font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
