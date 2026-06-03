const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailMataKuliahModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const fields = [
    { label: "Kode MK", value: val(data.kode_mk) },
    { label: "Nama Mata Kuliah", value: val(data.nama_mk) },
    { label: "Fakultas", value: val(data.fakultas) },
    { label: "Program Studi", value: val(data.prodi) },
    {
      label: "Semester",
      value: data.semester ? `Semester ${data.semester}` : "-",
    },
    { label: "SKS", value: data.sks ? `${data.sks} SKS` : "-" },
    { label: "Deskripsi", value: val(data.deskripsi), full: true },
  ];

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Detail Mata Kuliah
          </h3>
          <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1 rounded-full text-[12px] font-black uppercase">
            {data.sks ? `${data.sks} SKS` : "-"}
          </span>
        </div>

        <div className="px-7 py-6 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col gap-4">
            {fields.map(({ label, value, full }) => (
              <div key={label} className={full ? "col-span-2" : ""}>
                <p className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className="text-[14px] text-[#1E293B] font-medium">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

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
