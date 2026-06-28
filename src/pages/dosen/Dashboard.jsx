import StatCard from "../../layouts/auth/StatCard";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { formatFakultas } from "../../utils/formatters";

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
              {[
                {
                  mataKuliah: "Kalkulus 1",
                  kelas: "Reguler A",
                  fakultas: "Ilmu Komputer",
                  prodi: "Teknik Informatika",
                  pertemuan: "Pertemuan ke-3",
                  waktu: "08:00 – 10:30",
                  metode: "Synchronous",
                  status: "berjalan",
                },
                {
                  mataKuliah: "Pemrograman Web",
                  kelas: "Reguler B",
                  fakultas: "Ilmu Komputer",
                  prodi: "Teknik Informatika",
                  pertemuan: "Pertemuan ke-4",
                  waktu: "10:00 – 12:30",
                  metode: "Asynchronous",
                  status: "terjadwal",
                },
              ].map((s, i) => (
                <tr
                  key={i}
                  className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.mataKuliah}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.kelas}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {formatFakultas(s.fakultas)}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.prodi}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.pertemuan}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.waktu}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                    {s.metode}
                  </td>
                  <td className="py-4 px-4">
                    {s.status === "berjalan" ? (
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
                    {/* Menggunakan ArrowUpRight untuk indikasi Redirect ke page lain */}
                    <button
                      className="p-2 text-[#64748B] hover:text-[#167A61] hover:bg-[#167A61]/10 rounded-lg transition-all border border-transparent hover:border-[#167A61]/20"
                      title="Lihat Detail Pertemuan"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
                  "Status",
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
              {[
                {
                  pengguna: "Dimas Putra",
                  nomor_induk: "2210631170001",
                  matakuliah: "Pemograman",
                  kelas: "Reguler A",
                  pertemuan: "Pertemuan 1",
                  topik: "Pertanyaan seputar array di Javascript",
                  status: "Belum Dibaca",
                  waktu: "10 menit yang lalu",
                },
                {
                  pengguna: "Ahmad Fauzan",
                  nomor_induk: "2210631170002",
                  matakuliah: "Algorithm",
                  kelas: "Reguler C",
                  pertemuan: "Pertemuan 3",
                  topik: "Cara deploy aplikasi Node.js ke server",
                  status: "Sudah Dibaca",
                  waktu: "2 jam yang lalu",
                },
                {
                  pengguna: "Bayu Anggara",
                  nomor_induk: "2210631170003",
                  matakuliah: "Pemograman",
                  kelas: "Reguler A",
                  pertemuan: "Pertemuan 1",
                  topik: "Diskusi tugas akhir Pemrograman Web",
                  status: "Sudah Dibaca",
                  waktu: "5 jam yang lalu",
                },
              ].map((f, i) => (
                <tr
                  key={i}
                  className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {i + 1}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {f.pengguna}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                    {f.nomor_induk}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {f.matakuliah}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {f.kelas}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {f.pertemuan}
                  </td>
                  <td
                    className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] max-w-[250px]"
                    title={f.topik}
                  >
                    <span className="block truncate">{f.topik}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${f.status === 'Belum Dibaca'
                      ? 'bg-[#FEE2E2] text-[#EF4444]'
                      : 'bg-[#F1F5F9] text-[#64748B]'
                      }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {f.waktu}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      title="Lihat Pesan"
                      className="p-1.5 text-[#64748B] hover:text-[#167A61] transition-colors rounded-lg hover:bg-[#167A61]/10"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
