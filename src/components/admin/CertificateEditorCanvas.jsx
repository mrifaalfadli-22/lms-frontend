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
      { id: "nama_peserta",    label: "[NAMA_PESERTA]",    x: 361, y: 340, width: 400, height: 60,  fontSize: 32, color: "#000000", fontWeight: "bold" },
      { id: "nomor_sertifikat",label: "[NOMOR_SERTIFIKAT]",x: 361, y: 80,  width: 400, height: 40,  fontSize: 18, color: "#475569", fontWeight: "normal" },
      { id: "nama_kelas",      label: "[NAMA_KELAS]",      x: 361, y: 420, width: 400, height: 40,  fontSize: 20, color: "#1E293B", fontWeight: "semibold" },
      { id: "tanggal_terbit",  label: "[TANGGAL_TERBIT]",  x: 361, y: 620, width: 400, height: 36,  fontSize: 16, color: "#64748B", fontWeight: "normal" },
    ]
  );

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
                className="group border border-transparent hover:border-dashed hover:border-[#167A61] cursor-move flex items-center justify-center transition-colors"
              >
                <div
                  style={{
                    fontSize:   `${el.fontSize}px`,
                    color:      el.color,
                    fontWeight: el.fontWeight,
                    width:      "100%",
                    height:     "100%",
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign:  "center",
                    userSelect: "none",
                    pointerEvents: "none",
                    lineHeight: 1.3,
                  }}
                >
                  {el.label}
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
              <label className="block text-[12px] font-semibold text-[#1E293B] mb-2 uppercase tracking-wide">
                {el.label}
              </label>
              <div className="grid grid-cols-2 gap-2">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
