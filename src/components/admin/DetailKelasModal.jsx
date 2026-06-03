const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailKelasModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const fields = [
    { label: "Kode Kelas", value: val(data.kode_kelas) },
    { label: "Nama Kelas", value: val(data.nama_kelas) },
    { label: "Tahun Angkatan", value: val(data.tahun_angkatan) },
    { label: "Fakultas", value: val(data.fakultas) },
    { label: "Program Studi", value: val(data.prodi) },
    {
      label: "Dibuat Pada",
      value: data.created_at
        ? new Date(data.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-",
    },
    {
      label: "Diperbarui Pada",
      value: data.updated_at
        ? new Date(data.updated_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-",
    },
  ];

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden">
        <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-[#1E293B]">Detail Kelas</h3>
          <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1 rounded-full text-[12px] font-black uppercase">
            {val(data.kode_kelas)}
          </span>
        </div>

        <div className="px-7 py-6 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col gap-4">
            {fields.map(({ label, value }) => (
              <div key={label}>
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
