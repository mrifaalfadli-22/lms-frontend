import { X } from "lucide-react";

export default function DetailProgressModal({ isOpen, onClose, data, mataKuliah, kelas }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[650px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-start">
          <div>
            <h3 className="text-[20px] font-extrabold text-[#1E293B] mb-1.5 tracking-tight">
              Detail Nilai - {data.nama}
            </h3>
            <p className="text-[13px] font-medium text-[#64748B]">
              NPM: {data.nim} <span className="mx-1 text-gray-300">|</span> {mataKuliah} - {kelas}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#1E293B] transition-colors bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Cards */}
          <div className="grid grid-cols-3 gap-5 mb-10">
            <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <h4 className="text-[32px] font-black text-[#008B5E] leading-none mb-2 tracking-tight">85.00</h4>
              <p className="text-[13px] font-semibold text-[#64748B]">Rata-rata Ujian</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <h4 className="text-[32px] font-black text-[#008B5E] leading-none mb-2 tracking-tight">88.50</h4>
              <p className="text-[13px] font-semibold text-[#64748B]">Rata-rata Tugas</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <h4 className="text-[32px] font-black text-[#F59E0B] leading-none mb-2 tracking-tight">
                10 <span className="text-[22px] text-gray-300 mx-1 font-normal">/</span> 16
              </h4>
              <p className="text-[13px] font-semibold text-[#64748B]">Kehadiran</p>
            </div>
          </div>

          <h4 className="text-[15px] font-extrabold text-[#1E293B] mb-5">Rincian Nilai</h4>
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white">
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Komponen</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Judul</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Nilai</th>
                  <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#1E293B]">
                {[
                  { komp: "Kuis 1", jud: "HTML5 Basics", nilai: "90", status: "SELESAI", type: "success" },
                  { komp: "Kuis 2", jud: "CSS Layouting", nilai: "80", status: "SELESAI", type: "success" },
                  { komp: "Kuis 3", jud: "JavaScript DOM", nilai: "85", status: "SELESAI", type: "success" },
                  { komp: "Tugas 1", jud: "Membuat Landing Page", nilai: "92", status: "DINILAI", type: "success" },
                  { komp: "Tugas 2", jud: "Responsive Portfolio", nilai: "85", status: "DINILAI", type: "success" },
                  { komp: "Tugas 3", jud: "Interactive Web App", nilai: "-", status: "TUNDA", type: "warning" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 group">
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{row.komp}</td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{row.jud}</td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">{row.nilai}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-[12px] font-black tracking-wide uppercase ${row.type === 'success'
                        ? 'bg-[#ECFDF5] text-[#008B5E]'
                        : 'bg-[#FFFBEB] text-[#F59E0B]'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
