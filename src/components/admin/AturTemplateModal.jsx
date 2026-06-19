import { useState, useRef } from "react";
import { UploadCloud, X, File, Loader2 } from "lucide-react";

export default function AturTemplateModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await new Promise(res => setTimeout(res, 500));
      onSave(file);
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Atur Template Sertifikat
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 flex flex-col gap-4">
          <p className="text-[13px] text-gray-500">
            Unggah file template sertifikat. File harus berformat gambar (.png, .jpg) atau dokumen (.pdf).
          </p>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              file ? "border-[#167A61] bg-[#F0FAF6]" : "border-gray-200 hover:border-[#167A61] hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".png,.jpg,.jpeg,.pdf"
            />
            
            {file ? (
              <>
                <div className="w-12 h-12 bg-[#167A61]/10 text-[#167A61] rounded-full flex items-center justify-center mb-2">
                  <File size={24} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#1E293B]">{file.name}</p>
                  <p className="text-[12px] text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-2">
                  <UploadCloud size={24} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-[#167A61]">Klik untuk unggah</p>
                  <p className="text-[12px] text-gray-400 mt-1">atau seret dan lepas file di sini</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 bg-white sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!file || loading}
            className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Simpan Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
