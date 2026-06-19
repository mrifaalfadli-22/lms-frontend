import { useState, useMemo } from "react";
import { Search, ExternalLink, MessageSquare, Eye, Layout } from "lucide-react";
import Pagination from "../../components/common/Pagination";

// Dummy data (banyak)
const dummyData = [
  { id: 1, pengguna: "Dimas Putra", nomor_induk: "2210631170001", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 1", topik: "Pertanyaan seputar array di Javascript", status: "Belum Dibaca", waktu: "10 menit yang lalu" },
  { id: 2, pengguna: "Ahmad Fauzan", nomor_induk: "2210631170002", matakuliah: "Algorithm", kelas: "Reguler C", pertemuan: "Pertemuan 3", topik: "Cara deploy aplikasi Node.js ke server", status: "Sudah Dibaca", waktu: "2 jam yang lalu" },
  { id: 3, pengguna: "Bayu Anggara", nomor_induk: "2210631170003", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 1", topik: "Diskusi tugas akhir Pemrograman Web", status: "Sudah Dibaca", waktu: "5 jam yang lalu" },
  { id: 4, pengguna: "Siti Nurhaliza", nomor_induk: "2210631170004", matakuliah: "Basis Data", kelas: "Reguler B", pertemuan: "Pertemuan 2", topik: "Normalisasi tabel bentuk ke-3", status: "Belum Dibaca", waktu: "1 hari yang lalu" },
  { id: 5, pengguna: "Budi Santoso", nomor_induk: "2210631170005", matakuliah: "Basis Data", kelas: "Reguler B", pertemuan: "Pertemuan 2", topik: "Perbedaan LEFT JOIN dan RIGHT JOIN", status: "Sudah Dibaca", waktu: "1 hari yang lalu" },
  { id: 6, pengguna: "Rina Melati", nomor_induk: "2210631170006", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 4", topik: "Implementasi React Hooks pada form", status: "Belum Dibaca", waktu: "2 hari yang lalu" },
  { id: 7, pengguna: "Andi Saputra", nomor_induk: "2210631170007", matakuliah: "Algorithm", kelas: "Reguler C", pertemuan: "Pertemuan 4", topik: "Big O Notation untuk Bubble Sort", status: "Sudah Dibaca", waktu: "2 hari yang lalu" },
  { id: 8, pengguna: "Dewi Lestari", nomor_induk: "2210631170008", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 5", topik: "Mengatasi CORS error di Axios", status: "Belum Dibaca", waktu: "3 hari yang lalu" },
  { id: 9, pengguna: "Eko Prasetyo", nomor_induk: "2210631170009", matakuliah: "Basis Data", kelas: "Reguler B", pertemuan: "Pertemuan 3", topik: "Cara membuat Trigger di MySQL", status: "Sudah Dibaca", waktu: "3 hari yang lalu" },
  { id: 10, pengguna: "Tika Susanti", nomor_induk: "2210631170010", matakuliah: "Algorithm", kelas: "Reguler C", pertemuan: "Pertemuan 5", topik: "Algoritma Dijkstra untuk pencarian rute", status: "Sudah Dibaca", waktu: "4 hari yang lalu" },
  { id: 11, pengguna: "Rio Pratama", nomor_induk: "2210631170011", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 6", topik: "Konfigurasi Tailwind CSS di Vite", status: "Belum Dibaca", waktu: "5 hari yang lalu" },
  { id: 12, pengguna: "Lina Marlina", nomor_induk: "2210631170012", matakuliah: "Basis Data", kelas: "Reguler B", pertemuan: "Pertemuan 4", topik: "Memahami konsep ACID pada database", status: "Sudah Dibaca", waktu: "5 hari yang lalu" },
  { id: 13, pengguna: "Rudi Heryanto", nomor_induk: "2210631170013", matakuliah: "Algorithm", kelas: "Reguler C", pertemuan: "Pertemuan 6", topik: "Dynamic Programming vs Divide & Conquer", status: "Belum Dibaca", waktu: "6 hari yang lalu" },
  { id: 14, pengguna: "Nina Wati", nomor_induk: "2210631170014", matakuliah: "Pemrograman Web", kelas: "Reguler A", pertemuan: "Pertemuan 7", topik: "Perbedaan Local Storage dan Session Storage", status: "Sudah Dibaca", waktu: "1 minggu yang lalu" },
  { id: 15, pengguna: "Yoga Pratama", nomor_induk: "2210631170015", matakuliah: "Basis Data", kelas: "Reguler B", pertemuan: "Pertemuan 5", topik: "Keuntungan menggunakan Indexing", status: "Sudah Dibaca", waktu: "1 minggu yang lalu" },
];

export default function ForumDiskusiMahasiswa() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = Semua, "Belum Dibaca", "Sudah Dibaca"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter Data
  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchSearch =
        item.pengguna.toLowerCase().includes(search.toLowerCase()) ||
        item.nomor_induk.toLowerCase().includes(search.toLowerCase()) ||
        item.topik.toLowerCase().includes(search.toLowerCase()) ||
        item.matakuliah.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? item.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // Pagination Logic
  const totalItems = filteredData.length;
  const lastPage = Math.ceil(totalItems / perPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, perPage]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
        {/* Header */}
        <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
          <h3 className="text-[17px] font-extrabold text-[#1E293B]">
            Forum Diskusi Mahasiswa
          </h3>
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
              placeholder="Cari nama, NPM, mata kuliah, atau isi pesan..."
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-white cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Belum Dibaca">Belum Dibaca</option>
            <option value="Sudah Dibaca">Sudah Dibaca</option>
          </select>
        </div>

        {/* Table / State */}
        <div className="px-7 overflow-x-auto">
          {currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <Layout size={28} className="text-[#94A3B8]" />
              </div>
              <p className="text-[14px] font-bold text-[#64748B]">
                {search || statusFilter
                  ? "Data tidak ditemukan."
                  : "Belum ada diskusi."}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1">
                {search || statusFilter
                  ? "Coba ubah kata kunci atau filter pencarian."
                  : "Diskusi akan muncul setelah mahasiswa bertanya."}
              </p>
            </div>
          ) : (
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
                      className="py-4 px-4 text-[13px] font-bold text-[#64748B] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14px] text-[#1E293B]">
                {currentData.map((f, i) => (
                  <tr
                    key={f.id}
                    className="border-y border-[#E2E8F0] hover:bg-[#0E5C46]/5 transition-all duration-200 cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46] whitespace-nowrap">
                      {(currentPage - 1) * perPage + i + 1}
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
                    <td className="py-4 px-4 font-normal text-[#1E293B] group-hover:text-[#0E5C46]">
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
          )}
        </div>

        {/* Pagination */}
        {currentData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>
    </>
  );
}
