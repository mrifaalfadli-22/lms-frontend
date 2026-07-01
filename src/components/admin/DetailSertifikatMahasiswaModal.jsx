import { useState } from "react";
import { X, Eye, FileText, Download } from "lucide-react";
import LihatSertifikatModal from "./LihatSertifikatModal";

export default function DetailSertifikatMahasiswaModal({ isOpen, onClose, data }) {
  const [viewSertifikat, setViewSertifikat] = useState(null);

  if (!isOpen || !data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-[#1E293B]">Daftar Sertifikat Mahasiswa</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {data.mahasiswa} - {data.npm}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#F8FAFC]">
            {data.sertifikats && data.sertifikats.length > 0 ? (
              <div className="grid gap-4">
                {data.sertifikats.map((cert) => {
                  const tipe = cert.template?.tipe_sertifikat || "Tidak Diketahui";
                  let title = "Sertifikat";
                  if (tipe === 'pelatihan') title = "Sertifikat Pelatihan";
                  else if (tipe === 'kelulusan') title = "Sertifikat Kelulusan";
                  else if (tipe === 'nilai') title = "Transkrip Nilai";
                  const tanggal = new Date(cert.tanggal_terbit).toLocaleDateString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric",
                  });
                  
                  return (
                    <div key={cert.id_sertifikat} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[#1E293B]">{title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                              Tipe: {tipe}
                            </span>
                            <span className="text-[12px] text-gray-500">
                              Terbit: {tanggal}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-400 mt-1">No. {cert.nomor_sertifikat}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setViewSertifikat({
                            ...data,
                            id_template: cert.id_template,
                            noSertifikat: cert.nomor_sertifikat,
                            tanggalTerbit: tanggal,
                            daftar_nilai: cert.daftar_nilai || [],
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#167A61] bg-[#167A61]/10 rounded-xl hover:bg-[#167A61] hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-[#64748B] text-[14px]">Belum ada sertifikat yang terbit untuk mahasiswa ini.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <LihatSertifikatModal
        isOpen={!!viewSertifikat}
        onClose={() => setViewSertifikat(null)}
        data={viewSertifikat}
      />
    </>
  );
}
