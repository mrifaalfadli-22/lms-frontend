import { useState, useRef, useEffect } from "react";
import UbahSandiModal from "../../components/admin/UbahSandiModal";
import ConfirmSaveModal from "../../components/admin/ConfirmSaveModal";
import { useProfile } from "../../hooks/useProfile";
import { formatFakultas } from "../../utils/formatters";
import { profileService } from "../../services/profileService";
import NotificationPopup from "../../components/ui/NotificationPopup";
import { Loader2 } from "lucide-react";

export default function ProfilDosen() {
  const { user, updateUser, loading } = useProfile();
  const [showUbahSandi, setShowUbahSandi] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
    tanggal_lahir: "",
    alamat: ""
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "", title: "" });
  const fileInputRef = useRef(null);

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || user.name || "",
        email: user.email || "",
        nomor_telepon: user.nomor_telepon || "",
        tanggal_lahir: user.tanggal_lahir || "",
        alamat: user.alamat || ""
      });
      if (user.foto_profil_url) {
        setPreviewImage(user.foto_profil_url);
      }
    }
  }, [user]);

  // Dynamic values based on user profile context
  const fullName = formData.nama_lengkap || "Dosen Pengajar";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimpanProfilClick = () => {
    setShowConfirmSave(true);
  };

  const executeSave = async () => {
    setShowConfirmSave(false);
    setIsSaving(true);
    try {
      const result = await profileService.updateProfile(formData);
      updateUser(result.data);
      
      // Berikan jeda sedikit agar animasi loading terlihat natural
      await new Promise((resolve) => setTimeout(resolve, 800));

      setNotification({
        show: true,
        type: "success",
        title: "Berhasil",
        message: "Profil berhasil diperbarui!"
      });
    } catch (error) {
      console.error("Gagal menyimpan profil", error);
      setNotification({
        show: true,
        type: "error",
        title: "Gagal",
        message: error?.response?.data?.message || "Gagal menyimpan profil"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      try {
        const result = await profileService.uploadFoto(file);
        updateUser({ 
          foto_profil: result.data.foto_profil, 
          foto_profil_url: result.data.foto_profil_url 
        });
      } catch (error) {
        console.error("Gagal upload foto", error);
        setNotification({
          show: true,
          type: "error",
          title: "Gagal",
          message: error?.response?.data?.message || "Gagal mengupload foto"
        });
        // Revert preview jika gagal
        setPreviewImage(user?.foto_profil_url || null);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center animate-in zoom-in duration-200">
            <Loader2 size={36} className="animate-spin text-[#167A61] mb-4" />
            <p className="text-[#1E293B] font-bold text-[14px]">Memuat Data...</p>
          </div>
        </div>
      )}

      {notification.show && (
        <NotificationPopup
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ show: false, type: "", message: "", title: "" })}
        />
      )}

      <UbahSandiModal
        isOpen={showUbahSandi}
        onClose={() => setShowUbahSandi(false)}
        onSuccess={(msg) => setNotification({ show: true, type: "success", title: "Berhasil", message: msg })}
      />
      <ConfirmSaveModal
        isOpen={showConfirmSave}
        onCancel={() => setShowConfirmSave(false)}
        onConfirm={executeSave}
        title="Simpan Perubahan?"
        description="Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?"
      />

      {/* Kolom Kiri: Kartu Profil */}
      <div className="w-full lg:w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center shrink-0">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover shadow-inner mb-5 border-[3px] border-white ring-2 ring-[#167A61]/20"
          />
        ) : (
          <div className="w-32 h-32 bg-[#167A61] rounded-full flex items-center justify-center text-white text-[48px] font-medium mb-5 shadow-inner">
            {loading ? <Loader2 size={32} className="animate-spin" /> : initials}
          </div>
        )}
        <h2 className="text-[20px] font-extrabold text-[#1E293B] mb-2 text-center">
          {loading ? "Memuat..." : fullName}
        </h2>
        <span className="px-4 py-1.5 bg-[#F0FAF6] text-[#167A61] rounded-full text-[12px] font-bold mb-8">
          Dosen
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 border border-[#167A61] text-[#167A61] rounded-lg text-[13px] font-bold hover:bg-[#F0FAF6] transition-colors"
        >
          Ganti Foto Profil
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Kolom Kanan: Form Data */}
      <div className="w-full flex-1 flex flex-col gap-6">
        {/* Informasi Dasar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative">
          {/* Skeletons saat memuat data awal */}
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-[#167A61] mb-3" />
              <p className="text-[#1E293B] font-bold text-[14px]">Memuat Data Profil...</p>
            </div>
          )}
          
          <h3 className="text-[18px] font-extrabold text-[#1E293B] mb-6">
            Informasi Dasar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                NIDN / Nomor Induk
              </label>
              <input
                type="text"
                value={user?.nomor_induk || "-"}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Fakultas
              </label>
              <input
                type="text"
                value={formatFakultas(user?.fakultas) || "-"}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Program Studi
              </label>
              <input
                type="text"
                value={user?.prodi || "-"}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="nomor_telepon"
                value={formData.nomor_telepon}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
              Alamat Lengkap
            </label>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
            />
          </div>
          <button
            onClick={handleSimpanProfilClick}
            className="px-6 py-2.5 bg-[#167A61] text-white rounded-lg text-[13px] font-bold hover:bg-[#0E5C46] transition-colors shadow-sm"
          >
            Simpan Perubahan
          </button>
        </div>

        {/* Keamanan Akun */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-[18px] font-extrabold text-[#1E293B] mb-2">
            Keamanan Akun
          </h3>
          <p className="text-[13px] text-[#64748B] mb-6">
            Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
          </p>
          <button
            onClick={() => setShowUbahSandi(true)}
            className="px-6 py-2.5 bg-[#167A61] text-white rounded-lg text-[13px] font-bold hover:bg-[#0E5C46] transition-colors shadow-sm"
          >
            Perbarui Kata Sandi
          </button>
        </div>
      </div>
    </div>
  );
}
