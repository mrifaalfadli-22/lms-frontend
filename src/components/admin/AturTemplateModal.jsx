import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, File, Loader2 } from "lucide-react";
import CertificateEditorCanvas from "./CertificateEditorCanvas";
import api from "../../config/api";

const DEFAULT_LAYOUT = [
  { id: "nama_peserta",      label: "[NAMA_PESERTA]",      x: 361, y: 320, width: 400, height: 60,  fontSize: 32, color: "#000000", fontWeight: "bold",    fontFamily: "Playfair Display", textAlign: "center", isHidden: false },
  { id: "npm",               label: "[NPM]",               x: 361, y: 380, width: 400, height: 30,  fontSize: 18, color: "#333333", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "nomor_sertifikat",  label: "[NOMOR_SERTIFIKAT]",  x: 361, y: 80,  width: 400, height: 40,  fontSize: 18, color: "#475569", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "mata_kuliah_kelas", label: "[MATA_KULIAH_KELAS]", x: 361, y: 420, width: 400, height: 40,  fontSize: 20, color: "#1E293B", fontWeight: "semibold", fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "nama_dosen",        label: "[NAMA_DOSEN]",        x: 361, y: 450, width: 400, height: 30,  fontSize: 18, color: "#333333", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "nilai_tugas",       label: "[NILAI_TUGAS]",       x: 361, y: 470, width: 400, height: 30,  fontSize: 18, color: "#167A61", fontWeight: "semibold", fontFamily: "Montserrat",       textAlign: "center", isHidden: false },
  { id: "status_kelulusan",  label: "[STATUS_KELULUSAN]",  x: 361, y: 520, width: 400, height: 40,  fontSize: 24, color: "#167A61", fontWeight: "bold",    fontFamily: "Montserrat",       textAlign: "center", isHidden: false },
  { id: "tanggal_terbit",    label: "[TANGGAL_TERBIT]",    x: 361, y: 620, width: 400, height: 36,  fontSize: 16, color: "#64748B", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "qr_code",           label: "[QR_CODE]",           x: 80,  y: 80,  width: 150, height: 150, fontSize: 16, color: "#000000", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "center", isHidden: false },
  { id: "daftar_nilai",      label: "[DAFTAR_NILAI]",      x: 80,  y: 250, width: 300, height: 200, fontSize: 14, color: "#000000", fontWeight: "normal",  fontFamily: "Open Sans",        textAlign: "left",   isHidden: false },
];

const TABS = [
  { id: "pelatihan", label: "Sertifikat Pelatihan" },
  { id: "kelulusan", label: "Sertifikat Kompetensi" },
  { id: "nilai",     label: "Transkrip Nilai" },
];

export default function AturTemplateModal({ isOpen, onClose, onSave, activeTemplates }) {
  const [tipeSertifikat, setTipeSertifikat] = useState("pelatihan");
  const [file, setFile]         = useState(null);        // File baru yang dipilih user
  const [fileUrl, setFileUrl]   = useState(null);        // URL object untuk preview
  const [layoutData, setLayoutData] = useState(DEFAULT_LAYOUT);
  const [idTemplate, setIdTemplate] = useState(null);
  const [saving, setSaving]     = useState(false);
  const fileInputRef = useRef(null);

  // Setiap kali tab berubah atau modal terbuka → load template dari activeTemplates
  useEffect(() => {
    if (!isOpen) return;
    loadTab(tipeSertifikat);
  }, [isOpen, tipeSertifikat, activeTemplates]); // eslint-disable-line

  // Bersihkan state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileUrl(null);
      setLayoutData(DEFAULT_LAYOUT);
      setIdTemplate(null);
    }
  }, [isOpen]);

  // Buat object URL dari File baru yang dipilih
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const loadTab = (type) => {
    // Reset ke default dulu
    setFile(null);
    setIdTemplate(null);
    setLayoutData(DEFAULT_LAYOUT);

    if (!activeTemplates || activeTemplates.length === 0) {
      setFileUrl(null);
      return;
    }

    const tmpl = activeTemplates.find(t => t.tipe_sertifikat === type);
    if (!tmpl) {
      setFileUrl(null);
      return;
    }

    // Gunakan background_url (URL publik langsung) — tidak perlu download via API
    const bgUrl = tmpl.background_url || null;
    setFileUrl(bgUrl);
    setIdTemplate(tmpl.id_template);

    // Layout data — fallback ke default jika null/kosong
    const parsed = tmpl.layout_data
      ? (typeof tmpl.layout_data === "string" ? JSON.parse(tmpl.layout_data) : tmpl.layout_data)
      : null;
      
    let finalLayout = DEFAULT_LAYOUT;
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      finalLayout = [...parsed];
      // Tambahkan item baru dari DEFAULT_LAYOUT yang belum ada di database
      DEFAULT_LAYOUT.forEach(defItem => {
        if (!finalLayout.find(item => item.id === defItem.id)) {
          finalLayout.push(defItem);
        }
      });
    }
    
    setLayoutData(finalLayout);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSave = async () => {
    if (!fileUrl && !file) return;
    setSaving(true);
    try {
      await onSave(file, layoutData, tipeSertifikat, idTemplate);
      onClose();
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Gagal menyimpan template. Lihat console untuk detail.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const hasBackground = !!fileUrl; // Ada background = tampilkan editor

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-[92vw] h-[92vh] overflow-hidden">

        {/* ── Header + Tabs ── */}
        <div className="border-b border-gray-100 shrink-0">
          <div className="px-7 py-4 flex justify-between items-center">
            <h3 className="text-[17px] font-bold text-[#1E293B]">Atur Template Sertifikat</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="px-7 flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTipeSertifikat(tab.id)}
                className={`py-3 px-1 border-b-2 text-sm font-semibold transition-colors ${
                  tipeSertifikat === tab.id
                    ? "border-[#167A61] text-[#167A61]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-hidden bg-gray-50 relative flex flex-col items-center justify-center p-4">

          {!hasBackground ? (
            /* ── Empty state: belum ada background ── */
            <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm max-w-md w-full text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <File size={32} />
              </div>
              <h4 className="text-lg font-bold text-[#1E293B] mb-2">Desain Belum Tersedia</h4>
              <p className="text-sm text-gray-500 mb-6">
                Belum ada desain template untuk{" "}
                <b>{TABS.find(t => t.id === tipeSertifikat)?.label}</b>.
                Silakan upload gambar latar belakang (PNG/JPG) terlebih dahulu.
              </p>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#167A61]/40 bg-[#167A61]/5 hover:bg-[#167A61]/10 p-8 rounded-xl cursor-pointer transition-colors flex flex-col items-center gap-2"
              >
                <UploadCloud size={28} className="text-[#167A61]" />
                <span className="text-sm font-semibold text-[#167A61]">Pilih File atau Drag & Drop</span>
                <span className="text-xs text-gray-400">PNG, JPG — maks. 5MB</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".png,.jpg,.jpeg"
              />
            </div>
          ) : (
            /* ── Editor: sudah ada background ── */
            <div className="w-full h-full flex flex-col">
              {/* Tombol "Ganti Desain" di pojok kiri atas */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white shadow border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <UploadCloud size={15} />
                  Ganti Desain
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".png,.jpg,.jpeg"
                />
              </div>

              <CertificateEditorCanvas
                key={`${tipeSertifikat}-${idTemplate || "new"}-${fileUrl}`}
                backgroundUrl={fileUrl}
                initialLayout={layoutData}
                onLayoutChange={setLayoutData}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!hasBackground || saving}
            className="px-6 py-2.5 bg-[#167A61] hover:bg-[#0E5C46] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
              : "Simpan Template & Layout"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
