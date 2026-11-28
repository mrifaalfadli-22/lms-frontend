import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, File, FileText, Check, CheckCircle2, Loader2 } from "lucide-react";
import CertificateEditorCanvas from "./CertificateEditorCanvas";
import api from "../../config/api";

const DEFAULT_LAYOUT = [
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
];

const TABS = [
  { id: "pelatihan", label: "Sertifikat Pelatihan" },
  { id: "kelulusan", label: "Sertifikat Kompetensi" },
  { id: "nilai",     label: "Transkrip Nilai" },
];

/**
 * Gabungkan daftar logo sponsor global ke dalam layoutData sertifikat aktif.
 * Mempertahankan posisi/ukuran/isHidden logo jika sudah pernah diatur di tab ini.
 */
function mergeLogosWithLayout(baseLayout, logosList = []) {
  const safeBase = Array.isArray(baseLayout) ? baseLayout : DEFAULT_LAYOUT;
  const nonLogoItems = safeBase.filter(
    (item) => item.type !== "image" && !String(item.id || "").startsWith("logo_")
  );

  const logoItems = logosList.map((logo, idx) => {
    const elId = `logo_${logo.id_logo}`;
    const existing = safeBase.find(
      (item) => item.id === elId || item.logoId === logo.id_logo
    );

    if (existing) {
      return {
        ...existing,
        id: elId,
        type: "image",
        logoId: logo.id_logo,
        label: `[LOGO_${idx + 1}]`,
        namaFile: logo.nama_file,
        imageUrl: logo.url,
        downloadUrl: logo.download_url,
      };
    }

    return {
      id: elId,
      type: "image",
      logoId: logo.id_logo,
      label: `[LOGO_${idx + 1}]`,
      namaFile: logo.nama_file,
      imageUrl: logo.url,
      downloadUrl: logo.download_url,
      x: Math.max(80, 920 - idx * 125),
      y: 75,
      width: 110,
      height: 110,
      isHidden: false,
    };
  });

  return [...nonLogoItems, ...logoItems];
}

export default function AturTemplateModal({ isOpen, onClose, onSave, activeTemplates }) {
  const [tipeSertifikat, setTipeSertifikat] = useState("pelatihan");
  const [file, setFile]         = useState(null);        // File baru yang dipilih user
  const [fileUrl, setFileUrl]   = useState(null);        // URL object untuk preview
  const [layoutData, setLayoutData] = useState(DEFAULT_LAYOUT);
  const [idTemplate, setIdTemplate] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Galeri Logo Sponsor Global (sekali upload berlaku untuk ketiga sertifikat)
  const [sponsorLogos, setSponsorLogos] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingLogoId, setDeletingLogoId] = useState(null);

  const fileInputRef = useRef(null);

  // Muat daftar logo sponsor global saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;
    fetchSponsorLogos();
  }, [isOpen]);

  // Setiap kali tab berubah, modal terbuka, atau daftar template/logo berubah → load tab
  useEffect(() => {
    if (!isOpen) return;
    loadTab(tipeSertifikat, sponsorLogos);
  }, [isOpen, tipeSertifikat, activeTemplates]); // eslint-disable-line

  // Bersihkan state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFileUrl(null);
      setLayoutData(DEFAULT_LAYOUT);
      setIdTemplate(null);
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  // Buat object URL dari File baru yang dipilih
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const fetchSponsorLogos = async () => {
    try {
      const res = await api.get("/template-sertifikat/logos");
      if (res.data?.status === "success") {
        const list = res.data.data || [];
        setSponsorLogos(list);
        setLayoutData((prev) => mergeLogosWithLayout(prev, list));
      }
    } catch (err) {
      console.error("Gagal memuat galeri logo:", err);
    }
  };

  const loadTab = (type, currentLogos = sponsorLogos) => {
    // Reset ke default dulu
    setFile(null);
    setIdTemplate(null);

    if (!activeTemplates || activeTemplates.length === 0) {
      setFileUrl(null);
      setLayoutData(mergeLogosWithLayout(DEFAULT_LAYOUT, currentLogos));
      return;
    }

    const tmpl = activeTemplates.find((t) => t.tipe_sertifikat === type);
    if (!tmpl) {
      setFileUrl(null);
      setLayoutData(mergeLogosWithLayout(DEFAULT_LAYOUT, currentLogos));
      return;
    }

    const bgUrl = tmpl.background_url || null;
    setFileUrl(bgUrl);
    setIdTemplate(tmpl.id_template);

    const parsed = tmpl.layout_data
      ? typeof tmpl.layout_data === "string"
        ? JSON.parse(tmpl.layout_data)
        : tmpl.layout_data
      : null;

    let finalLayout = [...DEFAULT_LAYOUT];
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      finalLayout = [...parsed];
      DEFAULT_LAYOUT.forEach((defItem) => {
        if (!finalLayout.find((item) => item.id === defItem.id)) {
          finalLayout.push(defItem);
        }
      });
    }

    setLayoutData(mergeLogosWithLayout(finalLayout, currentLogos));
  };

  const handleUploadLogos = async (filesList) => {
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    const rawFiles = Array.from(filesList || []);
    const oversized = rawFiles.some((f) => f.size > MAX_SIZE_BYTES);
    if (oversized) {
      alert("Ukuran file gambar maksimal 5 MB.");
      return;
    }

    const validFiles = rawFiles.filter((f) =>
      ["image/jpeg", "image/jpg", "image/png"].includes(f.type)
    );
    if (validFiles.length === 0) {
      alert("Format file hanya mendukung JPG, JPEG, dan PNG.");
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      validFiles.forEach((f) => formData.append("files[]", f));

      const res = await api.post("/template-sertifikat/logos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        const updatedLogos = res.data.data || [];
        setSponsorLogos(updatedLogos);
        setLayoutData((prev) => mergeLogosWithLayout(prev, updatedLogos));
      }
    } catch (err) {
      console.error("Gagal mengunggah logo sponsor:", err);
      alert("Gagal mengunggah gambar logo. Pastikan format JPG, JPEG, atau PNG dan ukuran maks 5 MB.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async (idLogo) => {
    if (!idLogo || deletingLogoId) return;
    setDeletingLogoId(idLogo);
    try {
      const res = await api.delete(`/template-sertifikat/logos/${idLogo}`);
      if (res.data?.status === "success") {
        const remainingLogos = res.data.data || [];
        setSponsorLogos(remainingLogos);
        setLayoutData((prev) => mergeLogosWithLayout(prev, remainingLogos));
      }
    } catch (err) {
      console.error("Gagal menghapus logo sponsor:", err);
      alert("Gagal menghapus gambar logo.");
    } finally {
      setDeletingLogoId(null);
    }
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
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Gagal menyimpan template. Lihat console untuk detail.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const hasBackground = !!fileUrl;
  const activeTabLabel =
    TABS.find((t) => t.id === tipeSertifikat)?.label || "Sertifikat";

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-[94vw] max-w-[1360px] h-[92vh] overflow-hidden border border-[#E2E8F0]">

        {/* ── Header + Tabs ── */}
        <div className="border-b border-[#E2E8F0] bg-white shrink-0">
          <div className="px-7 pt-5 pb-3 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#167A61] shrink-0" strokeWidth={2.2} />
                <h3 className="text-[18px] font-bold text-[#0F172A] leading-tight">
                  Atur Template Sertifikat
                </h3>
              </div>
              <p className="text-[12.5px] text-[#64748B] mt-1">
                Konfigurasi tata letak placeholder data dinamis sertifikat & transkrip nilai
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#475569] transition-colors p-1 rounded-lg hover:bg-gray-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-7 flex gap-7">
            {TABS.map((tab) => {
              const isActive = tipeSertifikat === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTipeSertifikat(tab.id)}
                  className={`py-3 px-0.5 border-b-2 text-[13.5px] flex items-center gap-2 transition-colors ${
                    isActive
                      ? "border-[#167A61] text-[#167A61] font-bold"
                      : "border-transparent text-[#64748B] hover:text-[#334155] font-medium"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#167A61] shrink-0" />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Hidden File Input ── */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".png,.jpg,.jpeg"
        />

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-hidden bg-[#F8FAFC] relative flex">
          {!hasBackground ? (
            /* ── Empty state: belum ada background ── */
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="bg-white p-10 rounded-2xl border border-[#E2E8F0] shadow-sm max-w-md w-full text-center flex flex-col items-center">
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
              </div>
            </div>
          ) : (
            /* ── Editor: sudah ada background ── */
            <CertificateEditorCanvas
              key={`${tipeSertifikat}-${idTemplate || "new"}-${fileUrl}`}
              backgroundUrl={fileUrl}
              idTemplate={idTemplate}
              tipeSertifikat={tipeSertifikat}
              initialLayout={layoutData}
              onLayoutChange={setLayoutData}
              onChangeDesign={() => fileInputRef.current?.click()}
              sponsorLogos={sponsorLogos}
              uploadingLogo={uploadingLogo}
              deletingLogoId={deletingLogoId}
              onUploadLogos={handleUploadLogos}
              onDeleteLogo={handleDeleteLogo}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-4 border-t border-[#E2E8F0] flex justify-end items-center gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white hover:bg-gray-50 text-[#1E293B] border border-[#CBD5E1] text-[13.5px] font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!hasBackground || saving}
            className="px-6 py-2.5 bg-[#167A61] hover:bg-[#0E5C46] disabled:opacity-50 text-white text-[13.5px] font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Check size={16} strokeWidth={2.5} />
                Simpan Template & Layout
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Modal Sukses Menyimpan Template ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in fade-in zoom-in duration-200">
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#E8F5F1] rounded-full flex items-center justify-center mb-5 ring-8 ring-[#167A61]/5">
                <CheckCircle2 size={32} className="text-[#167A61]" strokeWidth={2.2} />
              </div>

              <h3 className="text-[17px] font-bold text-[#0F172A] mb-2">
                Template Berhasil Disimpan!
              </h3>
              <p className="text-[13px] text-[#64748B] leading-relaxed">
                Konfigurasi desain dan tata letak elemen untuk{" "}
                <span className="font-semibold text-[#1E293B]">{activeTabLabel}</span>{" "}
                telah berhasil disimpan dan diperbarui.
              </p>
            </div>

            <div className="px-8 pb-7 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={15} strokeWidth={2.5} />
                Oke, Mengerti
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#475569] text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Selesai & Tutup Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
