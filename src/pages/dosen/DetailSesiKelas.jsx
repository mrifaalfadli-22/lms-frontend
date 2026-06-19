import { useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Edit2, Eye } from "lucide-react";
import Pagination from "../../components/common/Pagination";
import UbahSesiModal from "../../components/dosen/UbahSesiModal";

const dummyPertemuan = Array.from({ length: 16 }).map((_, i) => ({
  id: i + 1,
  pertemuan: `Pertemuan ke-${i + 1}`,
  tanggal: `${(i + 1).toString().padStart(2, "0")} Maret 2026`,
  waktu: "08:00 - 09:30",
  metode: i % 2 === 0 ? "Synchronous" : "Asynchronous",
  materi: `Materi Perkuliahan Sesi ${i + 1}`,
  status: i === 5 ? "BERJALAN" : i < 5 ? "SELESAI" : "TERJADWAL",
}));

export default function DetailSesiKelas() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const jadwal = location.state?.groupData || null;
  const classData = location.state?.classData || null;

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editTarget, setEditTarget] = useState(null);

  return (
    <>
      <UbahSesiModal
        isOpen={!!editTarget}
        data={editTarget}
        onClose={() => setEditTarget(null)}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}`}
          state={{ groupData: jadwal }}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px] mr-2"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Daftar Kelas</span>
        </Link>

        <Link
          to={`/dosen/kelola-sesi-pertemuan/${id}`}
          state={{ groupData: jadwal }}
          className="hover:text-[#167A61] transition-colors"
        >
          {jadwal?.nama_mk || "Memuat..."}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{classData?.nama_kelas || "Memuat..."}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7 px-8">
        <h3 className="text-[17px] font-extrabold text-[#1E293B] mb-6">
          Sesi Pertemuan - {classData?.nama_kelas || ""} ({jadwal?.nama_mk || ""})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Pertemuan
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Tanggal
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Waktu
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Metode
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Materi
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Status
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {dummyPertemuan.map((item) => (
                <tr key={item.id} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                  <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {item.pertemuan}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {item.tanggal}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {item.waktu}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {item.metode}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {item.materi}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.status === "SELESAI" ? (
                      <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                        Selesai
                      </span>
                    ) : item.status === "BERJALAN" ? (
                      <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                        Berjalan
                      </span>
                    ) : (
                      <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                        Terjadwal
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/dosen/kelola-sesi-pertemuan/${id}/kelas/${kelasId}/pertemuan/${item.id}`}
                        state={{ groupData: jadwal, classData: classData, pertemuanName: item.pertemuan, pertemuanData: item }}
                        className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                      >
                        <Eye size={14} />
                        <span>Lihat Detail</span>
                      </Link>
                      <button
                        onClick={() => setEditTarget(item)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[#167A61] border border-[#167A61]/20 rounded-lg hover:bg-[#167A61] hover:text-white transition-all text-[13px] font-bold"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            lastPage={1}
            total={dummyPertemuan.length}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </>
  );
}
