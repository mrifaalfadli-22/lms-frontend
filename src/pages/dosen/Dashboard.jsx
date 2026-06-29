import StatCard from "../../layouts/auth/StatCard";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatFakultas } from "../../utils/formatters";
import { useDosenDashboard } from "../../hooks/useDosenDashboard";

export default function DosenDashboard() {
  const { stats, sesiHariIni, forumTerbaru, loading, error, refetch } = useDosenDashboard();

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#167A61]" />
        <p className="text-[14px] text-gray-500">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 flex flex-col items-center gap-3">
        <p className="text-[14px] text-red-500">{error}</p>
        <button onClick={refetch} className="text-[#167A61] underline text-[13px]">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      {/* 1. Row Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Mahasiswa Pendaftar" value={stats.total_mahasiswa} />
        <StatCard title="Mata Kuliah Aktif" value={stats.mata_kuliah_aktif} />
        <StatCard title="Kelas Aktif" value={stats.kelas_aktif} />
        <StatCard title="Sertifikat Perlu Verifikasi" value={stats.sertifikat_perlu_verifikasi} />
      </div>

      {/* 2. Card Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Jadwal Sesi Pertemuan Hari Ini
          </h3>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {[
                  "No",
                  "Mata Kuliah",
                  "Kelas",
                  "Fakultas",
                  "Program Studi",
                  "Pertemuan",
                  "Waktu",
                  "Metode",
                  "Status",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {sesiHariIni.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center text-[14px] text-[#94A3B8]">
                    Tidak ada jadwal pertemuan hari ini.
                  </td>
                </tr>
              ) : (
                sesiHariIni.map((s, i) => (
                  <tr
                    key={s.id_sesi}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {i + 1}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.jadwal_perkuliahan?.mata_kuliah?.nama_mk || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.jadwal_perkuliahan?.kelas?.nama_kelas || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {formatFakultas(s.jadwal_perkuliahan?.fakultas)}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.jadwal_perkuliahan?.prodi || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.judul_sesi || "Sesi " + s.urutan_sesi}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {s.jam_mulai ? s.jam_mulai.substring(0, 5) : "-"} – {s.jam_berakhir ? s.jam_berakhir.substring(0, 5) : "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] capitalize">
                      {s.metode_pertemuan || "-"}
                    </td>
                    <td className="py-4 px-4">
                      {s.is_aktif ? (
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
                      <Link
                        to={`/dosen/kelola-sesi-pertemuan/${s.id_jadwal}/kelas/${s.jadwal_perkuliahan?.id_kelas}/pertemuan/${s.id_sesi}`}
                        state={{
                          groupData: {
                            id_jadwal: s.id_jadwal,
                            id_mk: s.jadwal_perkuliahan?.id_mk,
                            nama_mk: s.jadwal_perkuliahan?.mata_kuliah?.nama_mk || "-",
                            kode_mk: s.jadwal_perkuliahan?.mata_kuliah?.kode_mk || "-",
                            sks: s.jadwal_perkuliahan?.sks,
                            semester: s.jadwal_perkuliahan?.semester,
                            tahun: s.jadwal_perkuliahan?.tahun,
                            fakultas: s.jadwal_perkuliahan?.fakultas,
                            prodi: s.jadwal_perkuliahan?.prodi,
                            nidn: s.jadwal_perkuliahan?.nidn,
                          },
                          classData: {
                            id_kelas: s.jadwal_perkuliahan?.id_kelas,
                            nama_kelas: s.jadwal_perkuliahan?.kelas?.nama_kelas || "-",
                            kode_kelas: s.jadwal_perkuliahan?.kelas?.kode_kelas || "-",
                            hari: s.jadwal_perkuliahan?.hari,
                            waktu_mulai: s.jadwal_perkuliahan?.waktu_mulai,
                            waktu_berakhir: s.jadwal_perkuliahan?.waktu_berakhir,
                            token_enrollment: s.jadwal_perkuliahan?.token_enrollment,
                            total_mahasiswa: null,
                          },
                          pertemuanName: s.judul_sesi || `Pertemuan ke-${s.pertemuan_ke}`,
                          pertemuanData: {
                            id_sesi: s.id_sesi,
                            judul_sesi: s.judul_sesi,
                            pertemuan_ke: s.pertemuan_ke,
                            tanggal_pelaksanaan: s.tanggal_pelaksanaan,
                            jam_mulai: s.jam_mulai,
                            jam_berakhir: s.jam_berakhir,
                            metode_pertemuan: s.metode_pertemuan,
                            materi: s.materi,
                            status: s.status,
                            link_kelas_daring: s.link_kelas_daring,
                          },
                        }}
                        className="p-2 text-[#64748B] hover:text-[#167A61] hover:bg-[#167A61]/10 rounded-lg transition-all border border-transparent hover:border-[#167A61]/20 inline-flex"
                        title="Lihat Detail Pertemuan"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Card Aktivitas Forum */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex justify-between items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Interaksi Forum Diskusi Mahasiswa
          </h3>
          <Link
            to="/dosen/forum-diskusi" // Sesuaikan dengan path routing verifikasi dosen milikmu
            className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-1.5 rounded-lg hover:bg-[#167A61] hover:text-white transition-all"
          >
            Lihat Semua
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {[
                  "No",
                  "Pengguna",
                  "NPM",
                  "Mata kuliah",
                  "Kelas",
                  "Pertemuan",
                  "Isi Pesan",
                  "Waktu",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              {forumTerbaru.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-[14px] text-[#94A3B8]">
                    Belum ada aktivitas forum.
                  </td>
                </tr>
              ) : (
                forumTerbaru.map((f, i) => (
                  <tr
                    key={f.id_pesan}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {i + 1}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.pengirim?.nama_lengkap || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                      {f.pengirim?.nomor_induk || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.sesi?.jadwal_perkuliahan?.mata_kuliah?.nama_mk || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.sesi?.jadwal_perkuliahan?.kelas?.nama_kelas || "-"}
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.sesi?.judul_sesi || "Sesi " + f.sesi?.urutan_sesi}
                    </td>
                    <td
                      className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] max-w-[250px]"
                      title={f.isi_pesan}
                    >
                      <span className="block truncate">{f.isi_pesan}</span>
                    </td>
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {f.created_at ? new Date(f.created_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : "-"}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/dosen/kelola-sesi-pertemuan/${f.sesi?.id_jadwal}/kelas/${f.sesi?.jadwal_perkuliahan?.id_kelas}/pertemuan/${f.sesi?.id_sesi}`}
                        state={{ activeTab: "forum" }}
                        title="Lihat Pesan"
                        className="p-1.5 text-[#64748B] hover:text-[#167A61] transition-colors rounded-lg hover:bg-[#167A61]/10 inline-flex items-center"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
