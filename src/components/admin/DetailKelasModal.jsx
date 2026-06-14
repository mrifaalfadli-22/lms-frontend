import { X } from "lucide-react";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailKelasModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-bold text-[#1E293B]">Detail Kelas</h3>
            <span className="bg-[#DCFCE7] text-[#008B5E] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {val(data.kode_kelas)}
            </span>
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
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-[13px] text-[#64748B]">Nama Kelas</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{val(data.nama_kelas)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-[13px] text-[#64748B]">Tahun Angkatan</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{val(data.tahun_angkatan)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-[13px] text-[#64748B]">Fakultas</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{val(data.fakultas)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-[13px] text-[#64748B]">Program Studi</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{val(data.prodi)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-[13px] text-[#64748B]">Dibuat Pada</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{formatDate(data.created_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[13px] text-[#64748B]">Diperbarui Pada</span>
              <span className="text-[14px] font-semibold text-[#1E293B]">{formatDate(data.updated_at)}</span>
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
