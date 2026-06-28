import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import api from "../../config/api";
import Pagination from "../../components/common/Pagination";
import DetailProgressModal from "../../components/dosen/DetailProgressModal";

export default function DetailMonitoringProgres() {
  const { id, kelasId } = useParams();
  const location = useLocation();
  const jadwal = location.state?.groupData || { nama_mk: "Mata Kuliah" };
  const classData = location.state?.classData || { nama_kelas: "Kelas" };

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [detailModalData, setDetailModalData] = useState(null);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgres = async () => {
      try {
        setLoading(true);
        // kelasId from route params is actually the id_jadwal
        const response = await api.get(`/dosen/monitoring-progres/${kelasId}`);
        if (response.data.success) {
          setMahasiswaList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching monitoring progres:", error);
      } finally {
        setLoading(false);
      }
    };
    if (kelasId) {
      fetchProgres();
    }
  }, [kelasId]);

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedMahasiswa = mahasiswaList.slice(startIndex, endIndex);

  const getProgressColor = (value) => {
    if (value < 50) return "bg-orange-500";
    return "bg-[#008B5E]";
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#64748B] mb-5">
        <Link
          to={`/dosen/monitoring-progres/${id}`}
          state={{ groupData: jadwal }}
          className="flex items-center gap-2 px-3 py-1.5 border border-[#167A61] text-[#167A61] rounded-xl bg-transparent hover:bg-[#F0FAF6] transition-all font-bold text-[13px] mr-2"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          <span>Kembali ke Daftar Kelas</span>
        </Link>
        <Link
          to={`/dosen/monitoring-progres/${id}`}
          state={{ groupData: jadwal }}
          className="hover:text-[#167A61] transition-colors"
        >
          {jadwal.nama_mk}
        </Link>
        <ChevronRight size={14} />
        <span className="text-[#1E293B] font-semibold">{classData.nama_kelas}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7 px-8">
        <h3 className="text-[17px] font-extrabold text-[#1E293B] mb-6">
          Aktivitas dan Nilai Mahasiswa - {classData.nama_kelas}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">No</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">NPM</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Nama Mahasiswa</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Aktivitas Log</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Nilai Akhir</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Progres Belajar</th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">Aksi Pantau</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#167A61]" />
                    <span className="text-[13px] font-medium">Memuat data progres...</span>
                  </td>
                </tr>
              ) : paginatedMahasiswa.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 text-[13px] font-medium">
                    Belum ada mahasiswa yang terdaftar di kelas ini.
                  </td>
                </tr>
              ) : (
                paginatedMahasiswa.map((m, idx) => (
                  <tr key={m.id} className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 group">
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {m.nim}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {m.nama}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {m.log}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[15px] font-black ${
                          parseFloat(m.rataRata) >= 70 ? 'text-[#0E5C46]' : 'text-red-500'
                        }`}>
                          {(() => {
                            const score = parseFloat(m.rataRata);
                            if (score >= 90) return "A";
                            if (score >= 85) return "A-";
                            if (score >= 80) return "B";
                            if (score >= 75) return "B-";
                            if (score >= 70) return "C";
                            if (score >= 65) return "C-";
                            return "D";
                          })()}
                        </span>
                        <span className="text-[11px] font-bold text-[#64748B]">
                          Rata-rata: {Math.round(parseFloat(m.rataRata))}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap min-w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#64748B]">{m.progres}% Selesai</span>
                        <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(m.progres)}`}
                            style={{ width: `${m.progres}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => setDetailModalData(m)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold"
                      >
                        <Eye size={14} />
                        <span>Detail Progress</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && mahasiswaList.length > 0 && (
          <div className="mt-6 border-t border-[#E2E8F0] pt-6">
            <Pagination
              currentPage={page}
              lastPage={Math.ceil(mahasiswaList.length / perPage)}
              total={mahasiswaList.length}
              perPage={perPage}
              onPageChange={(p) => setPage(p)}
              onPerPageChange={(l) => {
                setPerPage(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      <DetailProgressModal
        isOpen={!!detailModalData}
        onClose={() => setDetailModalData(null)}
        data={detailModalData}
        mataKuliah={jadwal.nama_mk}
        kelas={classData.nama_kelas}
        idJadwal={kelasId}
      />
    </>
  );
}
