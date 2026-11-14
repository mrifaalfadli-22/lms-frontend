import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, CalendarDays } from "lucide-react";
import { useJadwalKursus } from "../../hooks/useJadwalKursus";
import Pagination from "../common/Pagination";

export default function DaftarJadwalGrid({ title, basePath, dosenNidn, isDosenView }) {
  const {
    jadwal,
    loading,
    error,
    pagination,
    fetchGrouped,
    debouncedFetchGrouped,
  } = useJadwalKursus();

  const [search, setSearch] = useState("");

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const buildParams = useCallback(
    (page = 1, limit = itemsPerPage) => {
      const params = { page, per_page: limit };
      if (search) params.search = search;
      if (dosenNidn) params.nidn = dosenNidn;
      return params;
    },
    [search, itemsPerPage, dosenNidn],
  );

  // Fetch awal — pakai endpoint grouped
  useEffect(() => {
    // Jika halaman ini khusus dosen, tunggu sampai data NIDN benar-benar tersedia
    if (isDosenView && !dosenNidn) return;
    
    fetchGrouped(buildParams(1));
  }, [dosenNidn, isDosenView]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = { page: 1 };
    if (value) params.search = value;
    if (dosenNidn) params.nidn = dosenNidn;
    debouncedFetchGrouped(params);
  };

  const handlePageChange = (page) => {
    fetchGrouped(buildParams(page));
  };

  const handlePerPageChange = (newPerPage) => {
    setItemsPerPage(newPerPage);
    fetchGrouped(buildParams(1, newPerPage));
  };

  const val = (v) => (v === null || v === undefined || v === "" ? "-" : v);

  const filteredJadwal = jadwal.filter((j) => {
    if (dosenNidn && j.nidn !== dosenNidn) return false; // Antisipasi jika BE belum memfilter dengan parameter nidn
    return true;
  });
  // Grouping sudah dilakukan di BE, tidak perlu dedup manual

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-7">
      {/* Header */}
      <div className="flex justify-between items-center px-7 pb-5 flex-wrap gap-3">
        <h3 className="text-[17px] font-extrabold text-[#1E293B]">{title}</h3>
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
            onChange={handleSearchChange}
            placeholder="Cari kursus, kelas, atau pengajar..."
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] transition-all"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="px-7 pb-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[#94A3B8]">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-[13px]">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] font-bold text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[13px] text-[#167A61] font-semibold hover:underline"
            >
              Muat ulang halaman
            </button>
          </div>
        ) : filteredJadwal.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
              <CalendarDays size={28} className="text-[#94A3B8]" />
            </div>
            <p className="text-[14px] font-bold text-[#64748B]">
              {search
                ? "Data tidak ditemukan."
                : "Belum ada data."}
            </p>
            <p className="text-[13px] text-[#94A3B8] mt-1">
              {search
                ? "Coba ubah kata kunci atau filter pencarian."
                : "Data akan muncul setelah ditambahkan ke sistem."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredJadwal.map((j) => (
              <Link
                key={j.id_jadwal}
                to={`${basePath}/${j.id_jadwal}`}
                state={{ groupData: j }}
                className="relative block border border-[#E2E8F0] rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-white group overflow-hidden"
              >
                {/* Top border highlight - visible on hover */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-transparent group-hover:bg-[#167A61] transition-colors" />

                <h4 className="text-[16px] font-bold text-[#1E293B] mb-3 truncate" title={val(j.nama_mk)}>
                  {val(j.nama_mk)}
                </h4>

                <div className="space-y-1.5 mb-4">
                  <p className="text-[13px] text-[#64748B] truncate" title={val(j.nama_dosen)}>
                    Pengajar: {val(j.nama_dosen)}
                  </p>
                  <p className="text-[13px] text-[#64748B] truncate">
                    NIDN: {j.nidn ? j.nidn : "-"}
                  </p>
                  <p className="text-[13px] font-bold text-[#167A61] pt-1">
                    {j.jumlah_kelas} Kelas
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && jadwal.length > 0 && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </div>
  );
}
