import { useState, useRef } from "react";
import UbahSandiModal from "../../components/admin/UbahSandiModal";
import ConfirmSaveModal from "../../components/admin/ConfirmSaveModal";
import { useProfile } from "../../hooks/useProfile";
import { formatFakultas } from "../../utils/formatters";

export default function ProfilDosen() {
  const { user } = useProfile();
  const [showUbahSandi, setShowUbahSandi] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [saveType, setSaveType] = useState(""); // "profil" | "sandi"
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Dynamic values based on user profile context
  const fullName = user?.nama_lengkap || user?.name || "Dosen Pengajar";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSimpanProfilClick = () => {
    setSaveType("profil");
    setShowConfirmSave(true);
  };

  const handleSimpanSandiClick = () => {
    setShowUbahSandi(false);
    setTimeout(() => {
      setSaveType("sandi");
      setShowConfirmSave(true);
    }, 150);
  };

  const executeSave = () => {
    // API Save call simulation
    console.log(`Menyimpan data ${saveType}...`);
    setShowConfirmSave(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <UbahSandiModal
        isOpen={showUbahSandi}
        onClose={() => setShowUbahSandi(false)}
        onSave={handleSimpanSandiClick}
      />
      <ConfirmSaveModal
        isOpen={showConfirmSave}
        onCancel={() => setShowConfirmSave(false)}
        onConfirm={executeSave}
        title={saveType === "sandi" ? "Simpan Kata Sandi?" : "Simpan Perubahan?"}
        description={
          saveType === "sandi"
            ? "Apakah Anda yakin ingin memperbarui kata sandi Anda?"
            : "Apakah Anda yakin ingin menyimpan perubahan pada profil Anda?"
        }
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
            {initials}
          </div>
        )}
        <h2 className="text-[20px] font-extrabold text-[#1E293B] mb-2">{fullName}</h2>
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
                defaultValue={fullName}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={user?.email || "dosen@u-cademy.id"}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                NIDN / Nomor Induk
              </label>
              <input
                type="text"
                defaultValue={user?.nomor_induk || "1234567890"}
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
                defaultValue={formatFakultas(user?.fakultas)}
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
                defaultValue={user?.prodi || "Teknik Informatika"}
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
                defaultValue={user?.nomor_telepon || "081234567890"}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E293B] outline-none focus:border-[#167A61] transition-all"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#1E293B] mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                defaultValue={user?.tanggal_lahir || "1980-01-01"}
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
              defaultValue={user?.alamat || "Jl. Pajajaran, Bogor"}
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
