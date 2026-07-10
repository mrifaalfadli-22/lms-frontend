import { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import { materiSchema } from "../../schemas/materiSchema";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import Input from "../ui/Input";
import ConfirmSaveModal from "../admin/ConfirmSaveModal";
import materiService from "../../services/materiService";

export default function UploadMateriModal({ isOpen, onClose, editData, pertemuanId, onSaveSuccess }) {
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editData && editData.file_materi) {
      setExistingFiles(editData.file_materi);
    } else {
      setExistingFiles([]);
    }
  }, [editData]);

  const formik = useFormik({
    initialValues: {
      judul: editData?.title || "",
      deskripsi: editData?.deskripsi || "",
      link: editData?.link || "",
    },
    validationSchema: materiSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitError("");
      if (files.length === 0 && existingFiles.length === 0 && !values.link) {
        setSubmitError("Anda harus menyertakan minimal 1 file materi atau embed link referensi.");
        setSubmitting(false);
        return;
      }
      setShowConfirm(true);
      setSubmitting(false);
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    formik.resetForm();
    setFiles([]);
    setExistingFiles([]);
    setSubmitError("");
    setShowConfirm(false);
    onClose();
  };

  const handleConfirmSave = async () => {
    setConfirmLoading(true);
    try {
      const formData = new FormData();
      formData.append("id_sesi", pertemuanId);
      formData.append("judul_materi", formik.values.judul);
      if (formik.values.deskripsi) {
        formData.append("deskripsi", formik.values.deskripsi);
      } else {
        formData.append("deskripsi", "");
      }
      if (formik.values.link) {
        formData.append("link_video_pembelajaran", formik.values.link);
      }
      
      formData.append("has_kept_files", "1");
      existingFiles.forEach((file) => {
        formData.append("kept_files[]", file);
      });
      
      files.forEach((file) => {
        formData.append("file_materi[]", file);
      });
      
      if (editData) {
        await materiService.update(editData.id, formData);
      } else {
        await materiService.upload(formData);
      }
      
      if (onSaveSuccess) onSaveSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      setShowConfirm(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmSaveModal
        isOpen={showConfirm}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirm(false)}
        loading={confirmLoading}
        title={editData ? "Simpan Perubahan Materi?" : "Upload Materi Baru?"}
        description={editData ? "Apakah Anda yakin ingin menyimpan perubahan pada materi ini?" : "Apakah Anda yakin ingin mengunggah materi baru ini?"}
      />

      <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-7 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            {editData ? "Ubah Materi" : "Upload Materi Baru"}
          </h3>
        </div>

        <div className="overflow-y-auto flex-1 p-7 flex flex-col gap-2">
          <Input
            label="Judul Materi"
            name="judul"
            placeholder="Masukkan judul materi"
            value={formik.values.judul}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.judul}
            touched={formik.touched.judul}
          />

          <div className="w-full text-left">
            <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight">
              Deskripsi Materi
            </label>
            <textarea
              name="deskripsi"
              placeholder="Tuliskan deskripsi singkat materi"
              value={formik.values.deskripsi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full block mt-1.5 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#0E5C46] min-h-[80px] resize-y ${formik.touched.deskripsi && formik.errors.deskripsi ? "ring-2 ring-red-400 bg-white" : ""
                }`}
            />
            <div className="h-5 mt-1 ml-1">
              {formik.touched.deskripsi && formik.errors.deskripsi && (
                <p className="text-red-500 text-[11px] font-medium animate-fadeIn">
                  {formik.errors.deskripsi}
                </p>
              )}
            </div>
          </div>

          <div className="w-full text-left">
            <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight mb-1.5 block">
              File Materi
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#167A61]/30 rounded-xl bg-[#F0FAF6]/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F0FAF6]/60 transition-colors group"
            >
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
              />
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:-translate-y-1 transition-transform border border-[#167A61]/10">
                <UploadCloud className="text-[#167A61]" size={24} />
              </div>
              
              {(files.length > 0 || existingFiles.length > 0) ? (
                <div className="w-full">
                  <p className="text-[14px] font-bold text-[#1E293B] mb-2">{files.length + existingFiles.length} file dipilih</p>
                  <p className="text-[11px] text-[#167A61] mb-3">Pilih file lagi untuk menambahkan</p>
                  <div className="flex flex-col gap-2 items-center max-h-32 overflow-y-auto px-2">
                    {existingFiles.map((f, i) => (
                       <div key={`exist-${i}`} className="flex items-center justify-between w-full bg-white rounded-lg px-3 py-1.5 border border-gray-200">
                         <span className="text-[12px] font-medium text-gray-600 truncate max-w-[200px]" title={f.split('_').pop()}>
                           {f.split('_').pop()}
                         </span>
                         <button 
                           type="button" 
                           onClick={(e) => { e.stopPropagation(); removeExistingFile(i); }} 
                           className="text-red-400 hover:text-red-500 p-1"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                    ))}
                    {files.map((f, i) => (
                       <div key={`new-${i}`} className="flex items-center justify-between w-full bg-[#F0FAF6]/50 rounded-lg px-3 py-1.5 border border-[#167A61]/20">
                         <span className="text-[12px] font-medium text-[#167A61] truncate max-w-[200px]" title={f.name}>
                           {f.name} <span className="text-[10px] text-green-600 font-bold ml-1">(Baru)</span>
                         </span>
                         <button 
                           type="button" 
                           onClick={(e) => { e.stopPropagation(); removeFile(i); }} 
                           className="text-red-400 hover:text-red-500 p-1"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                       </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[14px] font-bold text-[#1E293B] mb-1">Klik untuk memilih file</p>
                  <p className="text-[12px] text-gray-500">PDF, DOC, PPT, XLS, PNG, JPG (Multiple, Maks. 50MB/file)</p>
                </>
              )}
            </div>
            <div className="h-5 mt-1 ml-1"></div>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Atau / Dan</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="w-full text-left">
            <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight">
              Embed Link Referensi
            </label>
            <div className="relative mt-1.5">
              <div className="absolute left-3 top-[calc(50%)] -translate-y-1/2 text-gray-400">
                <LinkIcon size={17} />
              </div>
              <input
                type="text"
                name="link"
                placeholder="Masukkan link ebook, video youtube, jurnal..."
                value={formik.values.link}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full block pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#0E5C46] ${formik.touched.link && formik.errors.link ? "ring-2 ring-red-400 bg-white" : ""
                  }`}
              />
            </div>
            <div className="h-5 mt-1 ml-1">
              {formik.touched.link && formik.errors.link && (
                <p className="text-red-500 text-[11px] font-medium animate-fadeIn">
                  {formik.errors.link}
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="px-7 py-5 border-t border-gray-100 flex flex-col gap-3 bg-white sticky bottom-0">
          {submitError && (
            <div className="bg-red-50 text-red-500 border border-red-100 text-[13px] font-semibold px-4 py-3 rounded-xl flex items-center justify-center text-center animate-fadeIn">
              {submitError}
            </div>
          )}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleClose}
              disabled={formik.isSubmitting || confirmLoading}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={formik.handleSubmit}
              disabled={formik.isSubmitting || confirmLoading}
              className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {editData ? "Simpan Perubahan" : "Upload Materi"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
