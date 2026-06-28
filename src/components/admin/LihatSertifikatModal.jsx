import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { X, Download, Loader2 } from "lucide-react";
import api from "../../config/api";
import { A4_WIDTH, A4_HEIGHT } from "../../config/certificateConstants";

export default function LihatSertifikatModal({ isOpen, onClose, data }) {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [scale, setScale] = useState(1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isOpen && data) {
      setTemplate(null);
      setBackgroundUrl("");
      fetchTemplate(data.id_template);
    }
  }, [isOpen, data]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Hitung scale agar canvas A4 muat dalam wrapper preview
  useEffect(() => {
    if (!isOpen) return;

    let animationFrameId;
    const calcScale = () => {
      if (!wrapperRef.current) return;
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
  }, [isOpen, backgroundUrl, loading]);

  const fetchTemplate = async (id_template) => {
    try {
      setLoading(true);
      const res = await api.get(`/template-sertifikat/${id_template}`);
      if (res.data.status === "success") {
        const tpl = res.data.data;
        setTemplate(tpl);
        // Gunakan background_url publik langsung — tidak perlu download blob
        const bgUrl = tpl.background_url
          || (tpl.file_background ? `http://127.0.0.1:8000/storage/${tpl.file_background}` : null);
        setBackgroundUrl(bgUrl || "");
      }
    } catch (err) {
      console.error("Gagal memuat template", err);
    } finally {
      setLoading(false);
    }
  };

  const resolveText = (el) => {
    switch (el.id) {
      case "nama_peserta":     return data?.mahasiswa    || el.label;
      case "npm":              return data?.npm          || el.label;
      case "nomor_sertifikat": return data?.noSertifikat || el.label;
      case "nama_kelas":       
      case "mata_kuliah_kelas":return (data?.mataKuliah ? `${data.mataKuliah}` : el.label);
      case "nilai_tugas":      return "Nilai: 90 (A)"; // Placeholder untuk preview Admin
      case "tanggal_terbit":   return data?.tanggalTerbit|| el.label;
      case "status_kelulusan": return data?.statusKelulusan || "LULUS";
      default:                 return el.label;
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width  = A4_WIDTH;
      canvas.height = A4_HEIGHT;
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background image (cover)
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // cover logic
          const hRatio = A4_WIDTH  / img.width;
          const vRatio = A4_HEIGHT / img.height;
          const ratio  = Math.max(hRatio, vRatio);
          const cx = (A4_WIDTH  - img.width  * ratio) / 2;
          const cy = (A4_HEIGHT - img.height * ratio) / 2;
          ctx.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
          resolve();
        };
        img.onerror = reject;
        img.src = backgroundUrl;
      });

      // Draw text elements
      const elements = typeof template.layout_data === "string"
        ? JSON.parse(template.layout_data)
        : template.layout_data;

      elements.forEach((el) => {
        if (el.isHidden) return;
        
        ctx.save();
        // Multi-line word wrap
        const text = resolveText(el);
        const fontWeight = el.fontWeight === "semibold" ? "600" : el.fontWeight;
        const fontFamily = el.fontFamily || "Arial";
        ctx.font = `${fontWeight} ${el.fontSize}px '${fontFamily}', sans-serif`;
        ctx.fillStyle = el.color;
        ctx.textAlign = el.textAlign || "center";
        ctx.textBaseline = "middle";

        let cx = el.x + el.width / 2;
        if (el.textAlign === 'left') cx = el.x;
        else if (el.textAlign === 'right') cx = el.x + el.width;
        
        const cy = el.y + el.height / 2;

        // Simple word wrap
        const words = text.split(" ");
        const lines = [];
        let current = "";
        words.forEach((word) => {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > el.width && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        });
        if (current) lines.push(current);

        const lineH = el.fontSize * 1.3;
        const startY = cy - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, cx, startY + i * lineH);
        });
        ctx.restore();
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      // Ukuran A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      pdf.save(`Sertifikat_${data.mahasiswa}.pdf`);
    } catch (error) {
      console.error("Gagal mendownload sertifikat", error);
      alert("Gagal mendownload sertifikat.");
    }
  };

  if (!isOpen) return null;

  const layoutElements =
    template?.layout_data
      ? typeof template.layout_data === "string"
        ? JSON.parse(template.layout_data)
        : template.layout_data
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-extrabold text-[#1E293B]">Detail Sertifikat</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.mahasiswa} — {data?.noSertifikat}
              <span className="ml-2 text-xs text-gray-400">(A4 Landscape)</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          ref={wrapperRef}
          className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-4"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-[#167A61] mb-4" />
              <p className="text-sm font-medium text-gray-500">Memuat template sertifikat...</p>
            </div>
          ) : !template || !backgroundUrl ? (
            <div className="text-center text-gray-500">
              <p>Template tidak ditemukan atau belum diatur.</p>
            </div>
          ) : (
            /* Container ukuran scaled — mencegah overflow di flex parent */
            <div style={{
              width:    A4_WIDTH  * scale,
              height:   A4_HEIGHT * scale,
              position: "relative",
              flexShrink: 0,
            }}>
              {/* Canvas A4 yang di-scale dari top-left */}
              <div
                style={{
                  width:           A4_WIDTH,
                  height:          A4_HEIGHT,
                  transform:       `scale(${scale})`,
                  transformOrigin: "top left",
                  position:        "absolute",
                  top: 0,
                  left: 0,
                  backgroundImage: `url(${backgroundUrl})`,
                  backgroundSize:  "cover",
                  backgroundRepeat:"no-repeat",
                  backgroundPosition: "center",
                  backgroundColor: "white",
                  boxShadow:       "0 4px 32px rgba(0,0,0,0.2)",
                }}
              >
              {/* Text overlays — koordinat identik dengan editor */}
              {layoutElements.map((el) => {
                if (el.isHidden) return null;
                return (
                  <div
                    key={el.id}
                    style={{
                      position:  "absolute",
                      left:      el.x,
                      top:       el.y,
                      width:     el.width,
                      height:    el.height,
                      display:   "flex",
                      alignItems:"center",
                      overflow:  "hidden",
                    }}
                  >
                    <span style={{
                      display:    "block",
                      width:      "100%",
                      textAlign:  el.textAlign || "center",
                      fontSize:   el.fontSize,
                      color:      el.color,
                      fontWeight: el.fontWeight === "semibold" ? 600 : (el.fontWeight || "normal"),
                      fontFamily: el.fontFamily || "Arial",
                      lineHeight: 1.3,
                      overflow:   "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {resolveText(el)}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !template || !backgroundUrl}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#167A61] rounded-xl hover:bg-[#0E5C46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Unduh Sertifikat</span>
          </button>
        </div>

      </div>
    </div>
  );
}
