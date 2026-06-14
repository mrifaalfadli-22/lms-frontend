import { X } from "lucide-react";

const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

export default function DetailJadwalModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed inset-0 z-[998] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-[900px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-bold text-[#1E293B]">
              Detail Jadwal Kuliah
            </h3>
            {data.hari && (
              <span className="bg-[#FFF7ED] text-[#C2410C] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                {data.hari}
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
        <div className="px-6 py-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="text-[13px] text-[#64748B]">Mata Kuliah</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.nama_mk)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Kode MK</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.kode_mk)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">SKS</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">
                {data.sks && data.sks !== "-" ? `${data.sks} SKS` : "-"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Kelas</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.kelas)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Kode Kelas</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.kode_kelas)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Fakultas</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.fakultas)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Program Studi</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.prodi)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Dosen Pengampu</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.nama_dosen)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">NIDN</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.nidn)}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Waktu</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">
                {data.waktu_mulai && data.waktu_berakhir
                  ? `${data.waktu_mulai.substring(0, 5)} - ${data.waktu_berakhir.substring(0, 5)}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Semester</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">
                {data.semester ? `Semester ${data.semester}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#64748B]">Tahun Ajaran</p>
              <p className="mt-1 text-[14px] font-semibold text-[#1E293B]">{val(data.tahun)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[13px] text-[#64748B]">Token Enrollment</p>
              <p className="mt-1 text-[14px] font-semibold font-mono text-[#1E293B] bg-gray-50 px-2 py-1.5 rounded border border-gray-200 w-fit">
                {val(data.token_enrollment)}
              </p>
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
