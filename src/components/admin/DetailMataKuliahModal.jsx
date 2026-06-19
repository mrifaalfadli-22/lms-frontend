import { X } from "lucide-react";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailMataKuliahModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const rows = [
    { label: "Kode MK", value: val(data.kode_mk) },
    { label: "Nama Mata Kuliah", value: val(data.nama_mk) },
    { label: "Fakultas", value: val(data.fakultas) },
    { label: "Program Studi", value: val(data.prodi) },
    { label: "SKS", value: data.sks ? `${data.sks} SKS` : "-" },
    { label: "Semester", value: data.semester ? `Semester ${data.semester}` : "-" },
    { label: "Deskripsi", value: val(data.deskripsi) },
  ];

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div>
            <h3 className="text-[18px] font-bold text-[#008B5E] leading-tight">
              Detail Mata Kuliah
            </h3>
            <p className="text-[13px] text-[#64748B] mt-1">
              Informasi lengkap mengenai mata kuliah ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="px-6 py-4 overflow-y-auto">
          <table className="w-full">
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 text-[13px] text-[#64748B] align-top">
                    {row.label}
                  </td>
                  <td className="py-3 text-[14px] font-medium text-[#1E293B] align-top">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
