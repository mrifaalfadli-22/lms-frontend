import { useState } from "react";
import { Search, Download, Settings2, Eye, Trash2 } from "lucide-react";

const SERTIFIKAT = [
  {
    noSertifikat: "CERT-2026-001",
    mahasiswa: "Dimas Putra Pratama",
    npm: "2210631170001",
    mataKuliah: "Kalkulus 1",
    semester: "Genap",
    tahun: "2026",
    dosen: "Dr. Fauzi Hamdan",
    nidn: "0412038901",
    tanggalTerbit: "04 April 2026",
  },
  {
    noSertifikat: "CERT-2026-003",
    mahasiswa: "Anwar Abdul",
    npm: "2210631170034",
    mataKuliah: "Algoritma & Pemrograman",
    semester: "Genap",
    tahun: "2026",
    dosen: "Budi Santoso, M.Kom",
    nidn: "0728068501",
    tanggalTerbit: "01 April 2026",
  },
  {
    noSertifikat: "CERT-2026-002",
    mahasiswa: "Irgi Febryansyah",
    npm: "221063117012",
    mataKuliah: "Pemrograman Web Dasar",
    semester: "Ganjil",
    tahun: "2026",
    dosen: "Siti Aminah, M.Pd",
    nidn: "0305076802",
    tanggalTerbit: "02 Januari 2026",
  },
  {
    noSertifikat: "CERT-2026-004",
    mahasiswa: "Sarah Widyantari",
    npm: "2210631170015",
    mataKuliah: "Struktur Data",
    semester: "Genap",
    tahun: "2025",
    dosen: "Budi Santoso, M.Kom",
    nidn: "0728068501",
    tanggalTerbit: "30 Maret 2025",
  },
  {
    noSertifikat: "CERT-2026-005",
    mahasiswa: "Bayu Anggara",
    npm: "2210631170042",
    mataKuliah: "Basis Data",
    semester: "Ganjil",
    tahun: "2025",
    dosen: "Dr. Fauzi Hamdan",
    nidn: "0412038901",
    tanggalTerbit: "28 Januari 2025",
  },
];

const tahunOptions = [...new Set(SERTIFIKAT.map((s) => s.tahun))].sort(
  (a, b) => b - a,
);

export default function KelolaSertifikat() {
  const [search, setSearch] = useState("");
  const [tahunFilter, setTahunFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const filtered = SERTIFIKAT.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      [s.noSertifikat, s.mahasiswa, s.npm, s.mataKuliah, s.dosen, s.nidn].some(
        (v) => v.toLowerCase().includes(q),
      );
    const matchTahun = !tahunFilter || s.tahun === tahunFilter;
    const matchSemester = !semesterFilter || s.semester === semesterFilter;
    return matchSearch && matchTahun && matchSemester;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
      {/* Header */}
      <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
        <h3 className="text-[17px] font-extrabold text-[#1E293B]">
          Daftar Sertifikat
        </h3>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 text-sm font-bold text-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#167A61] hover:text-white transition-all">
            <Download size={14} />
            Eksport Data
          </button>
          <button className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#167A61] border border-[#167A61] px-4 py-2 rounded-lg hover:bg-[#0E5C46] transition-all">
            <Settings2 size={14} />
            Atur Template
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 px-7 pb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            size={15}
            strokeWidth={2.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan no. sertifikat, mahasiswa, atau mata kuliah..."
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
          />
        </div>
        <select
          value={tahunFilter}
          onChange={(e) => setTahunFilter(e.target.value)}
          className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
        >
          <option value="">Semua Tahun</option>
          {tahunOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] bg-white cursor-pointer"
        >
          <option value="">Semua Semester</option>
          <option value="Ganjil">Ganjil</option>
          <option value="Genap">Genap</option>
        </select>
      </div>

      {/* Table */}
      <div className="px-7 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {[
                "No. Sertifikat",
                "Mahasiswa",
                "NPM",
                "Mata Kuliah",
                "Dosen",
                "NIDN",
                "Tanggal Terbit",
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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-[#94A3B8] text-[13px]"
                >
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr
                  key={i}
                  className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                >
                  <td className="py-4 px-4 font-semibold text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.noSertifikat}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.mahasiswa}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                    {s.npm}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.mataKuliah}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.dosen}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
                    {s.nidn}
                  </td>
                  <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                    {s.tanggalTerbit}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 text-[#2563EB] border border-[#2563EB]/20 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all text-[13px] font-bold">
                        <Eye size={14} />
                        <span>Lihat</span>
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-all text-[13px] font-bold">
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
