import StatCard from "../../layouts/auth/StatCard";
import { ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-9">
      {/* 1. Row Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <StatCard title="Total Mahasiswa" value="1180" />
        <StatCard title="Dosen Aktif" value="40" />
        <StatCard title="Kelas Aktif" value="56" />
        <StatCard title="Mata Kuliah" value="60" />
        <StatCard title="Sertifikat Terbit" value="860" />
      </div>

      {/* 2. Card Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex justify-between items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Pengajuan Verifikasi Dosen Terbaru
          </h3>
          <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-1.5 rounded-lg hover:bg-[#167A61] hover:text-white transition-all group">
            Lihat Semua
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Nama
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  NIDN
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Tanggal Pengajuan
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Budi Santoso, M.Kom
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  0412038901
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  04 April 2026
                </td>
                <td className="py-4 px-4">
                  <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                    pending
                  </span>
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Siti Aminah, M.Pd
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  0305076802
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  03 April 2026
                </td>
                <td className="py-4 px-4">
                  <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                    disetujui
                  </span>
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Reza Aditya, S.T
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  0728068501
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  02 April 2026
                </td>
                <td className="py-4 px-4">
                  <span className="bg-[#FEF2F2] text-[#991B1B] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                    ditolak
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Card Aktifitas Forum */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex justify-between items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Aktivitas Forum Terbaru
          </h3>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Pengguna
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Role
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Topik
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Dimas Putra
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Mahasiswa
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Pertanyaan seputar array di Javascript
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  10 menit yang lalu
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Sarah, S.T, M.Kom.
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Dosen
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Materi Kalkulus minggu ke-3
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  1 jam yang lalu
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Ahmad Fauzan
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Mahasiswa
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Cara deploy aplikasi Node.js ke server
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  2 jam yang lalu
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Rina Marlina
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Mahasiswa
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Perbedaan JOIN dan UNION di SQL
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  3 jam yang lalu
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Bayu Anggara
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Mahasiswa
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Diskusi tugas akhir Pemrograman Web
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  5 jam yang lalu
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
