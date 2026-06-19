import Input from "../ui/Input";

export default function UbahSandiModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

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
          <Input
            label="Kata Sandi Saat Ini"
            type="password"
            placeholder="Masukkan kata sandi saat ini"
          />
          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="Masukkan kata sandi baru"
          />
          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="Ketik ulang kata sandi baru"
          />
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-3 bg-[#167A61] hover:bg-[#0E5C46] text-white text-[13px] font-semibold rounded-xl transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
