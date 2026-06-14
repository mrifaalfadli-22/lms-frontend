import { X } from "lucide-react";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailMataKuliahModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-bold text-[#1E293B]">Detail Mata Kuliah</h3>
            {data.sks && (
              <span className="bg-[#DCFCE7] text-[#008B5E] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.sks} SKS
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto">
          <div className="flex flex-col">
            <div className="flex justify-between items-start py-3 border-b border-gray-100 gap-4">
              <span className="text-[13px] text-[#64748B] shrink-0">Kode MK</span>
              <span className="text-[14px] font-semibold text-[#1E293B] text-right">{val(data.kode_mk)}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 gap-4">
              <span className="text-[13px] text-[#64748B] shrink-0">Nama Mata Kuliah</span>
              <span className="text-[14px] font-semibold text-[#1E293B] text-right">{val(data.nama_mk)}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 gap-4">
              <span className="text-[13px] text-[#64748B] shrink-0">Fakultas</span>
              <span className="text-[14px] font-semibold text-[#1E293B] text-right">{val(data.fakultas)}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 gap-4">
              <span className="text-[13px] text-[#64748B] shrink-0">Program Studi</span>
              <span className="text-[14px] font-semibold text-[#1E293B] text-right">{val(data.prodi)}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 gap-4">
              <span className="text-[13px] text-[#64748B] shrink-0">Semester</span>
              <span className="text-[14px] font-semibold text-[#1E293B] text-right">
                {data.semester ? `Semester ${data.semester}` : "-"}
              </span>
            </div>
            <div className="flex flex-col items-start py-3 gap-1.5">
              <span className="text-[13px] text-[#64748B]">Deskripsi</span>
              <span className="text-[14px] font-semibold text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                {val(data.deskripsi)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-[#1E293B] text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
