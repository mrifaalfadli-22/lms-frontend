import { useState } from "react";
import Input from "../ui/Input";
import { profileService } from "../../services/profileService";

export default function UbahSandiModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setErrorMsg("");
    if (formData.new_password !== formData.new_password_confirmation) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    
    setIsLoading(true);
    try {
      await profileService.changePassword(formData);
      setFormData({ old_password: "", new_password: "", new_password_confirmation: "" });
      onClose();
      if (onSuccess) {
        onSuccess("Kata sandi berhasil diperbarui!");
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-[#1E293B]">
            Perbarui Kata Sandi
          </h3>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-4 flex flex-col gap-0">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg">
              {errorMsg}
            </div>
          )}
          <Input
            label="Kata Sandi Saat Ini"
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            placeholder="Masukkan kata sandi saat ini"
          />
          <Input
            label="Kata Sandi Baru"
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Masukkan kata sandi baru"
          />
          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            name="new_password_confirmation"
            value={formData.new_password_confirmation}
            onChange={handleChange}
            placeholder="Ketik ulang kata sandi baru"
          />
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
