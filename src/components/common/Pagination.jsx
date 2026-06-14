import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Komponen pagination reusable untuk semua halaman data.
 *
 * @param {number} currentPage - Halaman aktif saat ini
 * @param {number} lastPage - Total halaman terakhir
 * @param {number} total - Total seluruh data
 * @param {number} perPage - Jumlah data per halaman
 * @param {function} onPageChange - Callback saat halaman berubah
 */
export default function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}) {
  if (total === 0) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  // Bangun array nomor halaman yang akan ditampilkan
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);

    // Adjust start jika end sudah mentok di lastPage
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < lastPage) {
      if (end < lastPage - 1) pages.push("...");
      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 px-7">
      <div className="flex items-center gap-3">
        {onPerPageChange && (
          <div className="flex items-center gap-2 border-r border-[#E2E8F0] pr-3">
            <span className="text-[13px] text-[#64748B] hidden sm:inline">Tampilkan</span>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="border border-[#E2E8F0] rounded-lg px-2 py-1 text-[13px] font-semibold text-[#1E293B] outline-none focus:border-[#167A61] cursor-pointer bg-white"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
            </select>
          </div>
        )}
        <p className="text-[13px] text-[#64748B]">
          Menampilkan{" "}
          <span className="font-bold text-[#1E293B]">{from}</span>
          {" - "}
          <span className="font-bold text-[#1E293B]">{to}</span>
          {" dari "}
          <span className="font-bold text-[#1E293B]">{total}</span>
          {" data"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {/* Tombol Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-semibold rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Nomor Halaman */}
        {getPages().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-[13px] text-[#94A3B8]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] px-2.5 py-1.5 text-[13px] font-bold rounded-lg border transition-all ${
                page === currentPage
                  ? "bg-[#167A61] text-white border-[#167A61]"
                  : "text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Tombol Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-semibold rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
