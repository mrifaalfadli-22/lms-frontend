import StatCard from "../../layouts/auth/StatCard";
import { Settings2 } from "lucide-react";
export default function DosenDashboard() {
  return (
    <div className="space-y-9">
      {/* 1. Row Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Mahasiswa Pendaftar" value="345" />
        <StatCard title="Mata Kuliah Aktif" value="4" />
        <StatCard title="Kelas Aktif" value="8" />
        <StatCard title="Pesan Forum Baru" value="8" />
      </div>

      {/* 2. Card Jadwal Sesi */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex justify-between items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Jadwal Sesi Pertemuan Mendatang
          </h3>
          <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-1.5 rounded-lg hover:bg-[#167A61] hover:text-white transition-all group">
            <Settings2 size={14} />
            Atur Sesi
          </button>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Mata Kuliah
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Jadwal Pertemuan
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Metode Pertemuan
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Kalkulus 1
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  05 April 2026, 08:00
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Synchronous
                </td>
                <td className="py-4 px-4">
                  <span className="bg-[#DCFCE7] text-[#008B5E] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                    berjalan
                  </span>
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Pemrograman Web
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  06 April 2026, 10:00
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Asynchronous
                </td>
                <td className="py-4 px-4">
                  <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1.5 rounded-full text-[12px] font-black uppercase">
                    terjadwal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Card Interaksi Forum */}
      <div className="bg-white rounded-2xl shadow-sm border py-7 border-gray-100">
        <div className="flex justify-between items-center px-7 pb-4">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Interaksi Forum Mahasiswa
          </h3>
        </div>

        <div className="px-7 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Mahasiswa
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Pertanyaan Topik
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Mata Kuliah
                </th>
                <th className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-[#1E293B]">
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Ahmad F.
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Pertanyaan cara integrasi API Frontend?
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Pemrograman Web
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Baru Saja
                </td>
              </tr>
              <tr className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group">
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Siti Aisyah
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Mohon penjelasan materi Integral Substitusi
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  Kalkulus 1
                </td>
                <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                  2 jam yang lalu
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
