import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { A4_WIDTH, A4_HEIGHT } from "../../config/certificateConstants";

/**
 * CertificateEditorCanvas
 *
 * Canvas selalu berukuran A4 Landscape secara logis (1122×794px).
 * Secara visual, canvas di-scale agar muat dalam area yang tersedia,
 * namun koordinat x, y, width, height yang DISIMPAN selalu dalam
 * ruang koordinat A4 asli (tidak terpengaruh scale).
 */
export default function CertificateEditorCanvas({ backgroundUrl, initialLayout, onLayoutChange }) {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Parse initialLayout in case it's passed as a string
  const getInitialElements = () => {
    if (!initialLayout) return null;
    if (typeof initialLayout === "string") {
      try { return JSON.parse(initialLayout); } catch { return null; }
    }
    return initialLayout;
  };

  // Default layout di ruang A4
  const [elements, setElements] = useState(
    getInitialElements() || [
      { id: "nama_peserta",      label: "[NAMA_PESERTA]",      x: 361, y: 320, width: 400, height: 60,  fontSize: 32, color: "#000000", fontWeight: "bold", fontFamily: "Playfair Display", textAlign: "center", isHidden: false },
      { id: "npm",               label: "[NPM]",               x: 361, y: 380, width: 400, height: 30,  fontSize: 18, color: "#333333", fontWeight: "normal", fontFamily: "Open Sans", textAlign: "center", isHidden: false },
      { id: "nomor_sertifikat",  label: "[NOMOR_SERTIFIKAT]",  x: 361, y: 80,  width: 400, height: 40,  fontSize: 18, color: "#475569", fontWeight: "normal", fontFamily: "Open Sans", textAlign: "center", isHidden: false },
      { id: "mata_kuliah_kelas", label: "[MATA_KULIAH_KELAS]", x: 361, y: 420, width: 400, height: 40,  fontSize: 20, color: "#1E293B", fontWeight: "semibold", fontFamily: "Open Sans", textAlign: "center", isHidden: false },
      { id: "nilai_tugas",       label: "[NILAI_TUGAS]",       x: 361, y: 470, width: 400, height: 30,  fontSize: 18, color: "#167A61", fontWeight: "semibold", fontFamily: "Montserrat", textAlign: "center", isHidden: false },
      { id: "status_kelulusan",  label: "[STATUS_KELULUSAN]",  x: 361, y: 520, width: 400, height: 40,  fontSize: 24, color: "#167A61", fontWeight: "bold", fontFamily: "Montserrat", textAlign: "center", isHidden: false },
      { id: "tanggal_terbit",    label: "[TANGGAL_TERBIT]",    x: 361, y: 620, width: 400, height: 36,  fontSize: 16, color: "#64748B", fontWeight: "normal", fontFamily: "Open Sans", textAlign: "center", isHidden: false },
    ]
  );

  // Load Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Hitung scale agar canvas A4 muat di dalam wrapper
  useEffect(() => {
    let animationFrameId;
    const calcScale = () => {
      if (!wrapperRef.current) return;
      // Gunakan clientWidth/Height untuk mengecualikan scrollbar, dan kurangi padding (p-4 = 32px total)
      const { clientWidth, clientHeight } = wrapperRef.current;
      const scaleX = (clientWidth - 32)  / A4_WIDTH;
      const scaleY = (clientHeight - 32) / A4_HEIGHT;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(calcScale);
    };

    calcScale();
    const ro = new ResizeObserver(handleResize);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [backgroundUrl]);

  const updateElement = (id, newProps) => {
    const newElements = elements.map((el) => (el.id === id ? { ...el, ...newProps } : el));
    setElements(newElements);
    if (onLayoutChange) onLayoutChange(newElements);
  };

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Canvas Area — wrapper mengisi ruang yang tersedia */}
      <div
        ref={wrapperRef}
        className="flex-1 min-h-0 bg-gray-100 rounded-xl overflow-auto p-4 border border-[#E2E8F0] flex items-start justify-center"
      >
        {/* Container ukuran scaled (visual) — mencegah overflow */}
        <div style={{
          width:    A4_WIDTH  * scale,
          height:   A4_HEIGHT * scale,
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Canvas A4 yang di-scale dari top-left */}
          <div
            style={{
              width:  A4_WIDTH,
              height: A4_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundColor: "white",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
          {/* Wrapper yang meng-undo scale agar Rnd bekerja dalam piksel asli A4 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              // Rnd bekerja dalam ruang A4 asli, tanpa scale
            }}
          >
            {elements.map((el) => (
              <Rnd
                key={el.id}
                position={{ x: el.x, y: el.y }}
                size={{ width: el.width, height: el.height }}
                onDragStop={(event, d) => {
                  updateElement(el.id, { x: d.x, y: d.y });
                }}
                onResizeStop={(event, direction, ref, delta, position) => {
                  updateElement(el.id, {
                    width:  parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    x: position.x,
                    y: position.y,
                  });
                }}
                scale={scale}
                bounds="parent"
                className="group border border-transparent hover:border-dashed hover:border-[#167A61] cursor-move transition-colors"
              >
                {/* Wrapper: vertical center via flex */}
                <div style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  userSelect: "none",
                  pointerEvents: "none",
                  opacity: el.isHidden ? 0.3 : 1,
                  overflow: "hidden",
                }}>
                  {/* Inner span: full-width block, textAlign controls L/C/R */}
                  <span style={{
                    display: "block",
                    width: "100%",
                    textAlign: el.textAlign || "center",
                    fontSize: `${el.fontSize}px`,
                    color: el.color,
                    fontWeight: el.fontWeight === "semibold" ? "600" : (el.fontWeight || "normal"),
                    fontFamily: el.fontFamily || "Arial",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {el.isHidden ? `(Hidden) ${el.label}` : el.label}
                  </span>
                </div>
              </Rnd>
            ))}
          </div>
        </div>
        </div> {/* end scaled container */}
      </div>

      {/* Sidebar Controls */}
      <div className="w-[280px] bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm overflow-y-auto">
        <h4 className="text-[15px] font-bold text-[#1E293B] mb-1">Pengaturan Teks</h4>
        <p className="text-[11px] text-gray-400 mb-4">Canvas: A4 Landscape ({A4_WIDTH}×{A4_HEIGHT}px)</p>
        <div className="flex flex-col gap-5">
          {elements.map((el) => (
            <div key={el.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-semibold text-[#1E293B] uppercase tracking-wide">
                  {el.label}
                </label>
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id={`hide-${el.id}`}
                    checked={!el.isHidden} 
                    onChange={(e) => updateElement(el.id, { isHidden: !e.target.checked })}
                    className="w-3.5 h-3.5 accent-[#167A61] cursor-pointer"
                  />
                  <label htmlFor={`hide-${el.id}`} className="text-[11px] text-gray-500 cursor-pointer select-none">
                    Tampilkan
                  </label>
                </div>
              </div>
              
              <div className={`transition-opacity ${el.isHidden ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="mb-2.5">
                  <span className="block text-[11px] text-gray-500 mb-1">Jenis Font</span>
                  <select
                    value={el.fontFamily || "Arial"}
                    onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-[12px] outline-none focus:border-[#167A61]"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Lora">Lora</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1">Ukuran Font</span>
                    <input
                      type="number"
                      value={el.fontSize}
                      onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) || 12 })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-[13px] outline-none focus:border-[#167A61]"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 mb-1">Warna</span>
                    <input
                      type="color"
                      value={el.color}
                      onChange={(e) => updateElement(el.id, { color: e.target.value })}
                      className="w-full h-[28px] border border-gray-200 rounded cursor-pointer outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-gray-500 mb-1">Perataan Teks</span>
                  <div className="flex bg-gray-100 p-1 rounded gap-1">
                    <button 
                      onClick={() => updateElement(el.id, { textAlign: 'left' })}
                      className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${el.textAlign === 'left' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Left
                    </button>
                    <button 
                      onClick={() => updateElement(el.id, { textAlign: 'center' })}
                      className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${(!el.textAlign || el.textAlign === 'center') ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Center
                    </button>
                    <button 
                      onClick={() => updateElement(el.id, { textAlign: 'right' })}
                      className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${el.textAlign === 'right' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Right
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
