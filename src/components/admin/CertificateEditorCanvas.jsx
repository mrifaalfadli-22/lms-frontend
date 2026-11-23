import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { jsPDF } from "jspdf";
import {
  Upload,
  Grid3X3,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  QrCode,
  Eye,
  X,
  ExternalLink,
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import api from "../../config/api";
import { A4_WIDTH, A4_HEIGHT } from "../../config/certificateConstants";

const STATIC_PREVIEW_DATA = {
  nama_peserta: "Muhammad Hafidz Arif",
  npm: "231106040917",
  nomor_sertifikat: "No. SC/UIKA/2026/0001",
  mata_kuliah_kelas: "Pemrograman Web",
  nama_dosen: "Fitrah Satrya Fajar Kusumah, S.Kom., M.Kom",
  nilai_tugas: "Nilai: 90 (A)",
  status_kelulusan: "LULUS",
  tanggal_terbit: "23 November 2026",
  daftar_nilai: [
    { pertemuan: "1", tugas: "Pengenalan & Konsep Dasar", nilai: "88" },
    { pertemuan: "4", tugas: "Studi Kasus & Praktikum Mandiri", nilai: "90" },
    { pertemuan: "8", tugas: "Proyek Akhir & Evaluasi Kursus", nilai: "92" },
  ],
};

const SIDEBAR_ORDER = [
  "qr_code",
  "daftar_nilai",
  "nama_peserta",
  "nomor_sertifikat",
  "npm",
  "mata_kuliah_kelas",
  "nama_dosen",
  "nilai_tugas",
  "status_kelulusan",
  "tanggal_terbit",
];

/**
 * CertificateEditorCanvas
 *
 * Canvas selalu berukuran A4 Landscape secara logis (1122×794px).
 * Secara visual, canvas di-scale agar muat dalam area yang tersedia,
 * namun koordinat x, y, width, height yang DISIMPAN selalu dalam
 * ruang koordinat A4 asli (tidak terpengaruh scale).
 */
export default function CertificateEditorCanvas({
  backgroundUrl,
  idTemplate,
  tipeSertifikat = "pelatihan",
  initialLayout,
  onLayoutChange,
  onChangeDesign,
}) {
  const wrapperRef = useRef(null);
  const cardRefs = useRef({});
  const dragVirtualPosRef = useRef({ x: 0, y: 0 });
  const [fitScale, setFitScale] = useState(0.85);
  const [customScale, setCustomScale] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showGuides, setShowGuides] = useState(true);
  const [activeGuides, setActiveGuides] = useState({ x: null, y: null });
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

  const MIN_SCALE = 0.4;
  const MAX_SCALE = 2.0;
  const ZOOM_STEP = 0.1;
  const CENTER_SNAP_THRESHOLD = 10;
  const ELEMENT_SNAP_THRESHOLD = 6;

  const scale = customScale ?? fitScale;

  const handleZoomIn = () => {
    const next = Math.min(
      Math.round((scale + ZOOM_STEP) * 100) / 100,
      MAX_SCALE
    );
    setCustomScale(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(
      Math.round((scale - ZOOM_STEP) * 100) / 100,
      MIN_SCALE
    );
    setCustomScale(next);
  };

  const handleResetZoom = () => {
    setCustomScale(null);
  };

  const toggleExpand = (id) => {
    const isCurrentlyExpanded = expandedIds.includes(id);
    if (!isCurrentlyExpanded) {
      setSelectedId(id);
      setExpandedIds((prev) => [...prev, id]);
    } else {
      setExpandedIds((prev) => prev.filter((item) => item !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleSelectFromCanvas = (id) => {
    setSelectedId(id);
    setExpandedIds([id]);
    setTimeout(() => {
      cardRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 60);
  };

  // Parse initialLayout in case it's passed as a string
  const getInitialElements = () => {
    if (!initialLayout) return null;
    if (typeof initialLayout === "string") {
      try {
        return JSON.parse(initialLayout);
      } catch {
        return null;
      }
    }
    return initialLayout;
  };

  // Default layout di ruang A4
  const [elements, setElements] = useState(
    getInitialElements() || [
      { id: "nama_peserta",      label: "[NAMA_PESERTA]",      x: 361, y: 320, width: 400, height: 60,  fontSize: 32, color: "#000000", fontWeight: "bold",     fontFamily: "Playfair Display", textAlign: "center", isHidden: false },
      { id: "npm",               label: "[NPM]",               x: 361, y: 380, width: 400, height: 30,  fontSize: 18, color: "#333333", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "nomor_sertifikat",  label: "[NOMOR_SERTIFIKAT]",  x: 361, y: 80,  width: 400, height: 40,  fontSize: 18, color: "#475569", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "mata_kuliah_kelas", label: "[KURSUS_KELAS]",      x: 361, y: 420, width: 400, height: 40,  fontSize: 20, color: "#1E293B", fontWeight: "semibold", fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "nama_dosen",        label: "[NAMA_PENGAJAR]",     x: 361, y: 450, width: 400, height: 30,  fontSize: 18, color: "#333333", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "nilai_tugas",       label: "[NILAI_TUGAS]",       x: 361, y: 470, width: 400, height: 30,  fontSize: 18, color: "#167A61", fontWeight: "semibold", fontFamily: "Montserrat",       textAlign: "center", isHidden: false },
      { id: "status_kelulusan",  label: "[STATUS_KELULUSAN]",  x: 361, y: 520, width: 400, height: 40,  fontSize: 24, color: "#167A61", fontWeight: "bold",     fontFamily: "Montserrat",       textAlign: "center", isHidden: false },
      { id: "tanggal_terbit",    label: "[TANGGAL_TERBIT]",    x: 361, y: 620, width: 400, height: 36,  fontSize: 16, color: "#64748B", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "qr_code",           label: "[QR_CODE]",           x: 80,  y: 80,  width: 150, height: 150, fontSize: 16, color: "#000000", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
      { id: "daftar_nilai",      label: "[DAFTAR_NILAI]",      x: 80,  y: 250, width: 300, height: 200, fontSize: 14, color: "#000000", fontWeight: "normal",   fontFamily: "Open Sans",        textAlign: "left",   isHidden: false },
    ]
  );

  // Load Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Hitung scale agar canvas A4 muat secara proporsional di dalam wrapper
  useEffect(() => {
    let animationFrameId;
    const calcScale = () => {
      if (!wrapperRef.current) return;
      const { clientWidth, clientHeight } = wrapperRef.current;
      const scaleX = (clientWidth - 48) / A4_WIDTH;
      const scaleY = (clientHeight - 48) / A4_HEIGHT;
      setFitScale(Math.min(scaleX, scaleY, 1));
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
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...newProps } : el
    );
    setElements(newElements);
    if (onLayoutChange) onLayoutChange(newElements);
  };

  /**
   * Position Assist (Magnetic Snap) — seperti Figma / Canva / Photoshop
   * Mendeteksi titik tengah vertikal/horizontal canvas serta perataan dengan elemen lain.
   */
  const computeSnap = (draggedEl, rawX, rawY) => {
    let snappedX = Math.round(rawX);
    let snappedY = Math.round(rawY);
    let guideX = null;
    let guideY = null;

    const canvasCenterX = A4_WIDTH / 2;
    const canvasCenterY = A4_HEIGHT / 2;

    const elCenterX = rawX + draggedEl.width / 2;
    const elCenterY = rawY + draggedEl.height / 2;

    // 1. Snap Sumbu X (Garis Vertikal Tengah Canvas & Elemen Lain)
    if (Math.abs(elCenterX - canvasCenterX) <= CENTER_SNAP_THRESHOLD) {
      snappedX = Math.round(canvasCenterX - draggedEl.width / 2);
      guideX = { pos: canvasCenterX, type: "canvas-center", label: "Tengah Vertikal" };
    } else if (Math.abs(rawX - canvasCenterX) <= ELEMENT_SNAP_THRESHOLD) {
      snappedX = Math.round(canvasCenterX);
      guideX = { pos: canvasCenterX, type: "canvas-center", label: "Tengah Vertikal" };
    } else if (Math.abs(rawX + draggedEl.width - canvasCenterX) <= ELEMENT_SNAP_THRESHOLD) {
      snappedX = Math.round(canvasCenterX - draggedEl.width);
      guideX = { pos: canvasCenterX, type: "canvas-center", label: "Tengah Vertikal" };
    } else {
      let minDiffX = ELEMENT_SNAP_THRESHOLD + 1;
      elements.forEach((other) => {
        if (other.id === draggedEl.id || other.isHidden) return;
        const otherCenterX = other.x + other.width / 2;
        const candidates = [
          { target: otherCenterX, offset: draggedEl.width / 2 },
          { target: other.x, offset: 0 },
          { target: other.x + other.width, offset: draggedEl.width },
        ];
        candidates.forEach(({ target, offset }) => {
          const diff = Math.abs(rawX + offset - target);
          if (diff < minDiffX) {
            minDiffX = diff;
            snappedX = Math.round(target - offset);
            guideX = { pos: Math.round(target), type: "element" };
          }
        });
      });
    }

    // 2. Snap Sumbu Y (Garis Horizontal Tengah Canvas & Elemen Lain)
    if (Math.abs(elCenterY - canvasCenterY) <= CENTER_SNAP_THRESHOLD) {
      snappedY = Math.round(canvasCenterY - draggedEl.height / 2);
      guideY = { pos: canvasCenterY, type: "canvas-center", label: "Tengah Horizontal" };
    } else if (Math.abs(rawY - canvasCenterY) <= ELEMENT_SNAP_THRESHOLD) {
      snappedY = Math.round(canvasCenterY);
      guideY = { pos: canvasCenterY, type: "canvas-center", label: "Tengah Horizontal" };
    } else if (Math.abs(rawY + draggedEl.height - canvasCenterY) <= ELEMENT_SNAP_THRESHOLD) {
      snappedY = Math.round(canvasCenterY - draggedEl.height);
      guideY = { pos: canvasCenterY, type: "canvas-center", label: "Tengah Horizontal" };
    } else {
      let minDiffY = ELEMENT_SNAP_THRESHOLD + 1;
      elements.forEach((other) => {
        if (other.id === draggedEl.id || other.isHidden) return;
        const otherCenterY = other.y + other.height / 2;
        const candidates = [
          { target: otherCenterY, offset: draggedEl.height / 2 },
          { target: other.y, offset: 0 },
          { target: other.y + other.height, offset: draggedEl.height },
        ];
        candidates.forEach(({ target, offset }) => {
          const diff = Math.abs(rawY + offset - target);
          if (diff < minDiffY) {
            minDiffY = diff;
            snappedY = Math.round(target - offset);
            guideY = { pos: Math.round(target), type: "element" };
          }
        });
      });
    }

    return { x: snappedX, y: snappedY, guideX, guideY };
  };

  // Urutkan elemen di sidebar sesuai urutan pada contoh gambar
  const sortedSidebarElements = [...elements].sort((a, b) => {
    const idxA = SIDEBAR_ORDER.indexOf(a.id);
    const idxB = SIDEBAR_ORDER.indexOf(b.id);
    const orderA = idxA === -1 ? 999 : idxA;
    const orderB = idxB === -1 ? 999 : idxB;
    return orderA - orderB;
  });

  // Bersihkan blob URL saat unmount atau berubah
  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  const closePreviewPdf = () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    setPreviewPdfUrl(null);
  };

  const resolveStaticText = (el) => {
    return STATIC_PREVIEW_DATA[el.id] || el.label;
  };

  /**
   * Menggambar simulasi QR Code tajam langsung di atas Canvas 2D
   * (bebas kendala jaringan/CORS & langsung ter-render instan)
   */
  const drawStaticQrCode = (ctx, x, y, w, h) => {
    ctx.save();
    const size = Math.min(w, h);
    const offsetX = x + (w - size) / 2;
    const offsetY = y + (h - size) / 2;
    const grid = 21;
    const cell = size / (grid + 2);
    const startX = offsetX + cell;
    const startY = offsetY + cell;

    // White quiet zone
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(offsetX, offsetY, size, size);

    const isFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);

    const drawFinder = (r0, c0) => {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(startX + c0 * cell, startY + r0 * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        startX + (c0 + 1) * cell,
        startY + (r0 + 1) * cell,
        5 * cell,
        5 * cell
      );
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(
        startX + (c0 + 2) * cell,
        startY + (r0 + 2) * cell,
        3 * cell,
        3 * cell
      );
    };

    drawFinder(0, 0);
    drawFinder(0, grid - 7);
    drawFinder(grid - 7, 0);

    ctx.fillStyle = "#0F172A";
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if (isFinder(r, c)) continue;
        // Separator around finders
        if (
          (r === 7 && (c < 8 || c >= grid - 8)) ||
          (c === 7 && (r < 8 || r >= grid - 8)) ||
          (r === grid - 8 && c < 8) ||
          (c === grid - 8 && r < 8)
        ) {
          continue;
        }
        // Timing pattern & deterministic data modules
        const isTiming = (r === 6 || c === 6) && (r + c) % 2 === 0;
        const hash = ((r * 31 + c * 17 + r * c * 13 + 7) % 11) < 5;
        if (isTiming || hash) {
          ctx.fillRect(
            startX + c * cell,
            startY + r * cell,
            Math.ceil(cell),
            Math.ceil(cell)
          );
        }
      }
    }
    ctx.restore();
  };

  const handlePreviewPdf = async () => {
    if (generatingPdf || !backgroundUrl) return;
    setGeneratingPdf(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = A4_WIDTH;
      canvas.height = A4_HEIGHT;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gunakan endpoint CORS download-background apabila idTemplate tersedia dan bukan blob lokal
      const isLocalBlob =
        backgroundUrl.startsWith("blob:") || backgroundUrl.startsWith("data:");
      const baseUrl = api.defaults?.baseURL
        ? api.defaults.baseURL.replace("/api", "")
        : "";
      const primaryBgUrl =
        !isLocalBlob && idTemplate && baseUrl
          ? `${baseUrl}/api/template-sertifikat/${idTemplate}/download-background`
          : backgroundUrl;

      const loadBgImage = (url) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });

      let bgImg;
      try {
        bgImg = await loadBgImage(primaryBgUrl);
      } catch {
        bgImg = await loadBgImage(backgroundUrl);
      }

      const hRatio = A4_WIDTH / bgImg.width;
      const vRatio = A4_HEIGHT / bgImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const cxBg = (A4_WIDTH - bgImg.width * ratio) / 2;
      const cyBg = (A4_HEIGHT - bgImg.height * ratio) / 2;
      ctx.drawImage(
        bgImg,
        0,
        0,
        bgImg.width,
        bgImg.height,
        cxBg,
        cyBg,
        bgImg.width * ratio,
        bgImg.height * ratio
      );

      // Render setiap elemen aktif dengan data statis
      for (const el of elements) {
        if (el.isHidden) continue;

        if (el.id === "qr_code") {
          drawStaticQrCode(ctx, el.x, el.y, el.width, el.height);
          continue;
        }

        if (el.id === "daftar_nilai") {
          ctx.save();
          ctx.fillStyle = el.color || "#000000";
          ctx.font = `bold ${el.fontSize}px '${el.fontFamily || "Arial"}', sans-serif`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText("Pertemuan", el.x, el.y);
          ctx.fillText("Tugas", el.x + 150, el.y);
          ctx.fillText("Nilai", el.x + el.width - 42, el.y);

          ctx.beginPath();
          ctx.moveTo(el.x, el.y + el.fontSize + 5);
          ctx.lineTo(el.x + el.width, el.y + el.fontSize + 5);
          ctx.strokeStyle = el.color || "#000000";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = `normal ${el.fontSize}px '${el.fontFamily || "Arial"}', sans-serif`;
          const gradesData = STATIC_PREVIEW_DATA.daftar_nilai;
          let currentY = el.y + el.fontSize + 13;

          gradesData.forEach((row) => {
            ctx.fillText(`Pertemuan Ke-${row.pertemuan}`, el.x, currentY);
            ctx.fillText(row.tugas, el.x + 150, currentY);
            ctx.fillText(row.nilai, el.x + el.width - 36, currentY);
            currentY += el.fontSize + 10;
          });

          ctx.beginPath();
          ctx.moveTo(el.x, currentY);
          ctx.lineTo(el.x + el.width, currentY);
          ctx.lineWidth = 1;
          ctx.stroke();

          currentY += 6;
          ctx.font = `bold ${el.fontSize}px '${el.fontFamily || "Arial"}', sans-serif`;
          ctx.fillText("Rata-rata Nilai Akhir", el.x + 80, currentY);
          ctx.fillText("90 (A)", el.x + el.width - 48, currentY);

          ctx.restore();
          continue;
        }

        ctx.save();
        const text = resolveStaticText(el);
        const fontWeight = el.fontWeight === "semibold" ? "600" : el.fontWeight || "normal";
        const fontFamily = el.fontFamily || "Arial";
        ctx.font = `${fontWeight} ${el.fontSize}px '${fontFamily}', sans-serif`;
        ctx.fillStyle = el.color || "#000000";
        ctx.textAlign = el.textAlign || "center";
        ctx.textBaseline = "middle";

        let cx = el.x + el.width / 2;
        if (el.textAlign === "left") cx = el.x;
        else if (el.textAlign === "right") cx = el.x + el.width;

        const cy = el.y + el.height / 2;

        // Word wrap
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
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);

      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(blobUrl);
    } catch (error) {
      console.error("Gagal membuat preview PDF:", error);
      alert("Gagal memuat preview PDF sertifikat.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getTipeLabel = () => {
    if (tipeSertifikat === "kelulusan") return "Sertifikat Kompetensi";
    if (tipeSertifikat === "nilai") return "Transkrip Nilai";
    return "Sertifikat Pelatihan";
  };

  return (
    <div className="flex w-full h-full min-h-0 overflow-hidden">
      {/* ── Area Kiri: Toolbar + Canvas Sertifikat ── */}
      <div className="flex-1 min-w-0 bg-[#F8FAFC] flex flex-col p-5 gap-3.5 overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onChangeDesign}
              className="bg-white border border-[#E2E8F0] hover:bg-gray-50 text-[#1E293B] px-3.5 py-2 rounded-lg text-[12.5px] font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Upload size={14} className="text-[#475569]" strokeWidth={2.2} />
              <span>Ganti Desain</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuides((prev) => !prev)}
              className={`border px-3.5 py-2 rounded-lg text-[12.5px] shadow-sm transition-colors flex items-center gap-2 cursor-pointer ${
                showGuides
                  ? "bg-[#E8F5F1] border-[#167A61] text-[#167A61] font-semibold"
                  : "bg-white border-[#E2E8F0] hover:bg-gray-50 text-[#475569] font-medium"
              }`}
            >
              <Grid3X3
                size={14}
                className={showGuides ? "text-[#167A61]" : "text-[#64748B]"}
                strokeWidth={2}
              />
              <span>Garis Pandu</span>
            </button>

            <button
              type="button"
              onClick={handlePreviewPdf}
              disabled={generatingPdf}
              className="bg-white border border-[#E2E8F0] hover:bg-gray-50 hover:border-[#CBD5E1] text-[#1E293B] px-3.5 py-2 rounded-lg text-[12.5px] font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generatingPdf ? (
                <Loader2 size={14} className="text-[#167A61] animate-spin" />
              ) : (
                <Eye size={14} className="text-[#167A61]" strokeWidth={2.2} />
              )}
              <span>{generatingPdf ? "Memuat PDF..." : "Preview"}</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm flex items-center overflow-hidden">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= MIN_SCALE}
              title="Perkecil Canvas"
              className="px-2.5 py-2 text-[#64748B] hover:bg-gray-50 hover:text-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
            >
              <Minus size={13} strokeWidth={2.2} />
            </button>
            <span className="px-2 py-1.5 text-[12.5px] font-semibold text-[#1E293B] min-w-[48px] text-center select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= MAX_SCALE}
              title="Perbesar Canvas"
              className="px-2.5 py-2 text-[#64748B] hover:bg-gray-50 hover:text-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.2} />
            </button>
            <div className="w-[1px] h-4 bg-[#E2E8F0]" />
            <button
              type="button"
              onClick={handleResetZoom}
              className={`px-3.5 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                customScale !== null
                  ? "text-[#167A61] hover:bg-[#167A61]/5 font-semibold"
                  : "text-[#475569] hover:bg-gray-50 hover:text-[#1E293B]"
              }`}
            >
              Reset Ukuran
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={wrapperRef}
          className="flex-1 min-h-0 bg-[#F1F5F9]/80 rounded-2xl overflow-auto p-6 border border-[#E2E8F0] flex"
        >
          {/* Container ukuran scaled (visual) — m-auto agar tetap center saat kecil & bisa di-scroll penuh saat di-zoom besar */}
          <div
            className="m-auto"
            style={{
              width: A4_WIDTH * scale,
              height: A4_HEIGHT * scale,
              flexShrink: 0,
              position: "relative",
            }}
          >
            {/* Canvas A4 yang di-scale dari top-left */}
            <div
              style={{
                width: A4_WIDTH,
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
                boxShadow: "0 4px 24px rgba(15, 23, 42, 0.08)",
              }}
            >
              {/* ── Overlay Garis Pandu Statis (ketika Garis Pandu aktif) ── */}
              {showGuides && (
                <div
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
                >
                  {/* Safe Margin Area */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 56,
                      border: "1px dashed rgba(22, 122, 97, 0.22)",
                      borderRadius: 4,
                    }}
                  />
                  {/* Garis Tengah Vertikal Statis */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: A4_WIDTH / 2,
                      borderLeft: "1px dashed rgba(22, 122, 97, 0.35)",
                    }}
                  />
                  {/* Garis Tengah Horizontal Statis */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: A4_HEIGHT / 2,
                      borderTop: "1px dashed rgba(22, 122, 97, 0.35)",
                    }}
                  />
                </div>
              )}

              {/* ── Smart Position Assist / Magnetic Snap Lines (saat elemen di-drag) ── */}
              {(activeGuides.x || activeGuides.y) && (
                <div
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}
                >
                  {activeGuides.x && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: activeGuides.x.pos,
                        transform: "translateX(-50%)",
                      }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={
                          activeGuides.x.type === "canvas-center"
                            ? "h-full w-[1.5px] bg-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                            : "h-full border-l-[1.5px] border-dashed border-[#F43F5E]"
                        }
                      />
                      {activeGuides.x.type === "canvas-center" && (
                        <span className="absolute top-3 bg-[#F43F5E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                          Tengah Vertikal
                        </span>
                      )}
                    </div>
                  )}

                  {activeGuides.y && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: activeGuides.y.pos,
                        transform: "translateY(-50%)",
                      }}
                      className="flex items-center"
                    >
                      <div
                        className={
                          activeGuides.y.type === "canvas-center"
                            ? "w-full h-[1.5px] bg-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                            : "w-full border-t-[1.5px] border-dashed border-[#F43F5E]"
                        }
                      />
                      {activeGuides.y.type === "canvas-center" && (
                        <span className="absolute left-3 bg-[#F43F5E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                          Tengah Horizontal
                        </span>
                      )}
                    </div>
                  )}

                  {/* Titik perpotongan tepat di tengah canvas */}
                  {activeGuides.x?.type === "canvas-center" &&
                    activeGuides.y?.type === "canvas-center" && (
                      <div
                        style={{
                          position: "absolute",
                          left: A4_WIDTH / 2,
                          top: A4_HEIGHT / 2,
                          transform: "translate(-50%, -50%)",
                        }}
                        className="w-3.5 h-3.5 rounded-full border-2 border-[#F43F5E] bg-white shadow-sm"
                      />
                    )}
                </div>
              )}

              {/* Layer Rnd dalam piksel asli A4 */}
              <div
                onMouseDown={() => setSelectedId(null)}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                }}
              >
                {elements.map((el) => {
                  const isSelected = !el.isHidden && selectedId === el.id;
                  return (
                    <Rnd
                      key={el.id}
                      position={{ x: el.x, y: el.y }}
                      size={{ width: el.width, height: el.height }}
                      disableDragging={el.isHidden}
                      enableResizing={!el.isHidden}
                      style={{
                        pointerEvents: el.isHidden ? "none" : "auto",
                      }}
                      onMouseDown={(e) => {
                        if (el.isHidden) return;
                        e.stopPropagation();
                        handleSelectFromCanvas(el.id);
                      }}
                      onDragStart={() => {
                        if (el.isHidden) return;
                        handleSelectFromCanvas(el.id);
                        dragVirtualPosRef.current = { x: el.x, y: el.y };
                      }}
                      onDrag={(event, d) => {
                        if (el.isHidden) return;
                        const dx = d.x - el.x;
                        const dy = d.y - el.y;
                        const rawX = Math.max(
                          0,
                          Math.min(A4_WIDTH - el.width, dragVirtualPosRef.current.x + dx)
                        );
                        const rawY = Math.max(
                          0,
                          Math.min(A4_HEIGHT - el.height, dragVirtualPosRef.current.y + dy)
                        );
                        dragVirtualPosRef.current = { x: rawX, y: rawY };

                        if (showGuides) {
                          const { x: snappedX, y: snappedY, guideX, guideY } =
                            computeSnap(el, rawX, rawY);
                          setActiveGuides({ x: guideX, y: guideY });
                          updateElement(el.id, { x: snappedX, y: snappedY });
                        } else {
                          setActiveGuides({ x: null, y: null });
                          updateElement(el.id, {
                            x: Math.round(rawX),
                            y: Math.round(rawY),
                          });
                        }
                      }}
                      onDragStop={(event, d) => {
                        if (el.isHidden) return;
                        const dx = d.x - el.x;
                        const dy = d.y - el.y;
                        if (dx !== 0 || dy !== 0) {
                          const rawX = Math.max(
                            0,
                            Math.min(A4_WIDTH - el.width, dragVirtualPosRef.current.x + dx)
                          );
                          const rawY = Math.max(
                            0,
                            Math.min(A4_HEIGHT - el.height, dragVirtualPosRef.current.y + dy)
                          );
                          if (showGuides) {
                            const { x: snappedX, y: snappedY } = computeSnap(
                              el,
                              rawX,
                              rawY
                            );
                            updateElement(el.id, { x: snappedX, y: snappedY });
                          } else {
                            updateElement(el.id, {
                              x: Math.round(rawX),
                              y: Math.round(rawY),
                            });
                          }
                        }
                        setActiveGuides({ x: null, y: null });
                      }}
                      onResizeStart={() => {
                        if (el.isHidden) return;
                        handleSelectFromCanvas(el.id);
                      }}
                      onResizeStop={(event, direction, ref, delta, position) => {
                        if (el.isHidden) return;
                        setActiveGuides({ x: null, y: null });
                        updateElement(el.id, {
                          width: parseInt(ref.style.width),
                          height: parseInt(ref.style.height),
                          x: Math.round(position.x),
                          y: Math.round(position.y),
                        });
                      }}
                      scale={scale}
                      bounds="parent"
                      className={`group transition-all rounded-md ${
                        el.isHidden
                          ? "border border-transparent cursor-default pointer-events-none"
                          : isSelected
                          ? "cursor-move border-2 border-dashed border-[#167A61] bg-[#167A61]/15 shadow-sm"
                          : "cursor-move border border-transparent hover:border-dashed hover:border-[#167A61]/60 hover:bg-[#167A61]/5"
                      }`}
                    >
                      {el.id === "qr_code" ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            userSelect: "none",
                            pointerEvents: "none",
                            opacity: el.isHidden ? 0.3 : 1,
                          }}
                          className={`rounded-md p-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                            isSelected
                              ? "bg-transparent"
                              : "border border-[#167A61]/50 bg-white/90 shadow-sm"
                          }`}
                        >
                          <div className="bg-[#0F172A] text-white p-2 rounded flex items-center justify-center flex-1 w-full max-w-[96px] max-h-[96px]">
                            <QrCode className="w-full h-full" strokeWidth={1.8} />
                          </div>
                          <span
                            style={{
                              fontSize: `${Math.min(el.fontSize || 12, 13)}px`,
                              color: el.color || "#000000",
                              fontFamily: el.fontFamily || "Open Sans",
                            }}
                            className="font-mono font-bold tracking-tight leading-none mt-0.5"
                          >
                            {el.isHidden ? `(Hidden) ${el.label}` : el.label}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            userSelect: "none",
                            pointerEvents: "none",
                            opacity: el.isHidden ? 0.3 : 1,
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: el.textAlign || "center",
                              fontSize: `${el.fontSize}px`,
                              color: el.color,
                              fontWeight:
                                el.fontWeight === "semibold"
                                  ? "600"
                                  : el.fontWeight || "normal",
                              fontFamily: el.fontFamily || "Arial",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {el.isHidden ? `(Hidden) ${el.label}` : el.label}
                          </span>
                        </div>
                      )}
                    </Rnd>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Area Kanan: Sidebar Pengaturan Elemen ── */}
      <div className="w-[330px] lg:w-[350px] xl:w-[370px] shrink-0 bg-white border-l border-[#E2E8F0] flex flex-col min-h-0">
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0 bg-white">
          <div>
            <h4 className="text-[13px] font-extrabold text-[#0F172A] tracking-wider uppercase">
              PENGATURAN ELEMEN
            </h4>
            <p className="text-[11.5px] text-[#64748B] leading-snug mt-0.5">
              Sesuaikan tipografi & posisi placeholder
            </p>
          </div>
        </div>

        {/* Sidebar Element Cards */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#F8FAFC]/60">
          {sortedSidebarElements.map((el) => {
            const isExpanded = expandedIds.includes(el.id);
            const isSelected = !el.isHidden && selectedId === el.id;

            return (
              <div
                key={el.id}
                ref={(node) => {
                  cardRefs.current[el.id] = node;
                }}
                onClick={() => {
                  if (!el.isHidden) setSelectedId(el.id);
                }}
                className={`bg-white border rounded-xl p-4 shadow-sm transition-all shrink-0 ${
                  isSelected
                    ? "border-[#167A61] ring-2 ring-[#167A61]/15"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                {/* Card Header */}
                <div className={`flex items-center justify-between ${isExpanded ? "mb-3.5" : ""}`}>
                  <label
                    htmlFor={`hide-${el.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      id={`hide-${el.id}`}
                      checked={!el.isHidden}
                      onChange={(e) => {
                        const willHide = !e.target.checked;
                        updateElement(el.id, { isHidden: willHide });
                        if (willHide && selectedId === el.id) {
                          setSelectedId(null);
                        }
                      }}
                      className="w-4 h-4 accent-[#167A61] rounded cursor-pointer shrink-0"
                    />
                    <span
                      className={`text-[12.5px] font-bold tracking-tight font-mono transition-colors ${
                        el.isHidden ? "text-[#94A3B8] line-through" : "text-[#0F172A]"
                      }`}
                    >
                      {el.label}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(el.id);
                    }}
                    className={`text-[11.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      isExpanded
                        ? "text-[#167A61] hover:text-[#0E5C46]"
                        : "text-[#94A3B8] hover:text-[#167A61]"
                    }`}
                  >
                    {isExpanded ? (
                      <>
                        <span>Tutup</span>
                        <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        <span>Sunting</span>
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* Card Controls (ketika di-expand) */}
                {isExpanded && (
                  <div
                    className={`transition-opacity pt-3 border-t border-[#F1F5F9] ${
                      el.isHidden ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* Jenis Font */}
                    <div className="mb-3">
                      <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                        Jenis Font
                      </span>
                      <div className="relative">
                        <select
                          value={el.fontFamily || "Open Sans"}
                          onChange={(e) =>
                            updateElement(el.id, { fontFamily: e.target.value })
                          }
                          className="w-full appearance-none border border-[#E2E8F0] bg-white rounded-lg px-3 py-2 pr-8 text-[12.5px] font-medium text-[#1E293B] outline-none focus:border-[#167A61] transition-colors cursor-pointer"
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
                        <ChevronDown
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Ukuran Font & Warna */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div>
                        <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                          Ukuran Font
                        </span>
                        <div className="flex items-center border border-[#E2E8F0] bg-white rounded-lg px-3 py-1.5 focus-within:border-[#167A61] transition-colors">
                          <input
                            type="number"
                            value={el.fontSize}
                            onChange={(e) =>
                              updateElement(el.id, {
                                fontSize: parseInt(e.target.value) || 12,
                              })
                            }
                            className="w-full text-[12.5px] font-semibold text-[#1E293B] outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-[11px] text-[#94A3B8] select-none ml-1">
                            px
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                          Warna
                        </span>
                        <label className="relative flex items-center gap-2 border border-[#E2E8F0] bg-white rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#CBD5E1] transition-colors">
                          <span
                            className="w-4 h-4 rounded-sm border border-gray-200 shrink-0"
                            style={{ backgroundColor: el.color || "#000000" }}
                          />
                          <span className="text-[12px] font-mono text-[#475569] uppercase truncate">
                            {el.color || "#000000"}
                          </span>
                          <input
                            type="color"
                            value={el.color || "#000000"}
                            onChange={(e) =>
                              updateElement(el.id, { color: e.target.value })
                            }
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Perataan Teks */}
                    <div>
                      <span className="block text-[11px] font-medium text-[#64748B] mb-1.5">
                        Perataan Teks
                      </span>
                      <div className="flex bg-[#F1F5F9] p-1 rounded-lg gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateElement(el.id, { textAlign: "left" })
                          }
                          className={`flex-1 py-1.5 text-[11.5px] rounded-md transition-all ${
                            el.textAlign === "left"
                              ? "bg-white shadow-sm text-[#0F172A] font-semibold"
                              : "text-[#64748B] hover:text-[#1E293B] font-medium"
                          }`}
                        >
                          Kiri
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateElement(el.id, { textAlign: "center" })
                          }
                          className={`flex-1 py-1.5 text-[11.5px] rounded-md transition-all ${
                            !el.textAlign || el.textAlign === "center"
                              ? "bg-white shadow-sm text-[#0F172A] font-semibold"
                              : "text-[#64748B] hover:text-[#1E293B] font-medium"
                          }`}
                        >
                          Tengah
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateElement(el.id, { textAlign: "right" })
                          }
                          className={`flex-1 py-1.5 text-[11.5px] rounded-md transition-all ${
                            el.textAlign === "right"
                              ? "bg-white shadow-sm text-[#0F172A] font-semibold"
                              : "text-[#64748B] hover:text-[#1E293B] font-medium"
                          }`}
                        >
                          Kanan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Jendela Modal Preview PDF Sertifikat ── */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[1180px] h-[88vh] flex flex-col overflow-hidden border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
            {/* Header Jendela PDF */}
            <div className="px-6 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5F1] text-[#167A61] flex items-center justify-center shrink-0">
                  <FileText size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-bold text-[#0F172A]">
                      Preview PDF — {getTipeLabel()}
                    </h4>
                    <span className="bg-[#E8F5F1] text-[#167A61] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Data Simulasi
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B]">
                    Simulasi hasil akhir sertifikat dalam format dokumen PDF (A4 Landscape)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#1E293B] border border-[#CBD5E1] rounded-xl text-[12.5px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={14} className="text-[#475569]" />
                  <span>Buka di Tab Baru</span>
                </a>
                <a
                  href={previewPdfUrl}
                  download={`Preview_${getTipeLabel().replace(/\s+/g, "_")}.pdf`}
                  className="px-3.5 py-2 bg-[#167A61] hover:bg-[#0E5C46] text-white rounded-xl text-[12.5px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Unduh PDF</span>
                </a>
                <button
                  type="button"
                  onClick={closePreviewPdf}
                  className="p-2 text-[#94A3B8] hover:text-[#475569] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer ml-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div className="flex-1 bg-[#323639] overflow-hidden">
              <iframe
                src={previewPdfUrl}
                title="Preview PDF Sertifikat"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
