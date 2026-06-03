// components/admin/DetailJadwalModal.jsx
const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailJadwalModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const fields = [
    { label: "Mata Kuliah", value: val(data.nama_mk) },
    { label: "Kode MK", value: val(data.kode_mk) },
    {
      label: "SKS",
      value: data.sks !== "-" && data.sks !== null ? `${data.sks} SKS` : "-",
    },
    { label: "Kelas", value: val(data.kelas) },
    { label: "Kode Kelas", value: val(data.kode_kelas) },
    { label: "Fakultas", value: val(data.fakultas) },
    { label: "Program Studi", value: val(data.prodi) },
    { label: "Dosen Pengampu", value: val(data.nama_dosen) },
    { label: "NIDN", value: val(data.nidn) },
    { label: "Hari", value: val(data.hari) },
    {
      label: "Waktu",
      value:
        data.waktu_mulai && data.waktu_berakhir
          ? `${data.waktu_mulai.substring(0, 5)} - ${data.waktu_berakhir.substring(0, 5)}`
          : "-",
    },
    {
      label: "Semester",
      value:
        data.semester !== null && data.semester !== undefined
          ? `Semester ${data.semester}`
          : "-",
    },
    { label: "Tahun Ajaran", value: val(data.tahun) },
    {
      label: "Token Enrollment",
      value: val(data.token_enrollment),
      mono: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Detail Jadwal Kuliah
          </h3>
          {data.hari && (
            <span className="bg-[#FFF7ED] text-[#C2410C] px-3 py-1 rounded-full text-[12px] font-black uppercase">
              {data.hari}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col gap-4">
            {fields.map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p
                  className={`text-[14px] text-[#1E293B] font-medium ${mono ? "font-mono tracking-widest" : ""}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
