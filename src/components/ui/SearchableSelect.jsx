import { useState, useRef, useEffect } from "react";

export default function SearchableSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Pilih...",
  error,
  touched,
  disabled = false,
  disabledMessage = "",
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, rectTop: 0, left: 0, width: 0, isUpward: false });
  const containerRef = useRef(null);
  const triggerRef = useRef(null); // ✅ ref khusus trigger
  const searchRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const isUpward = spaceBelow < 250 && spaceAbove > spaceBelow;

      setDropdownPos({
        top: rect.bottom,
        rectTop: rect.top,
        left: rect.left,
        width: rect.width,
        isUpward,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setOpen(false);
    setSearch("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <div className="w-full text-left" ref={containerRef}>
      <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight">
        {label}
      </label>

      <div className="relative mt-1.5" ref={triggerRef}>
        {" "}
        {/* ✅ ref pindah ke sini */}
        <button
          type="button"
          onClick={handleToggle}
          onBlur={onBlur}
          name={name}
          disabled={disabled}
          className={`
            w-full px-4 py-3
            border border-gray-300
            rounded-lg
            text-sm text-left flex items-center justify-between
            outline-none transition-all duration-200
            focus:bg-white focus:ring-2 focus:ring-[#0E5C46]
            ${error && touched ? "ring-2 ring-red-400 bg-white" : ""}
            ${disabled ? "bg-[#F3F6F6]" : "bg-white cursor-pointer"}
          `}
        >
          <span className={selected ? "text-gray-700" : "text-gray-400/80"}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open && (
          <div
            style={{
              position: "fixed",
              top: dropdownPos.isUpward ? "auto" : dropdownPos.top + 4,
              bottom: dropdownPos.isUpward ? window.innerHeight - dropdownPos.rectTop + 4 : "auto",
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
            }}
            className={`bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col ${dropdownPos.isUpward ? 'flex-col-reverse' : ''}`}
          >
            {searchable && (
              <div className={`p-2 border-gray-100 ${dropdownPos.isUpward ? 'border-t' : 'border-b'}`}>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-[#F3F6F6] outline-none focus:ring-2 focus:ring-[#0E5C46] focus:bg-white transition-all duration-200"
                />
              </div>
            )}
            <ul className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">
                  Tidak ditemukan
                </li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${
                        opt.value === value
                          ? "bg-[#0E5C46]/10 text-[#0E5C46] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="h-5 mt-1 ml-1">
        {disabled && disabledMessage ? (
          <p className="text-gray-400 text-[11px] font-medium">
            {disabledMessage}
          </p>
        ) : error && touched ? (
          <p className="text-red-500 text-[11px] font-medium animate-fadeIn">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
