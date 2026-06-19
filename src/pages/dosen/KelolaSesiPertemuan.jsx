import DaftarJadwalGrid from "../../components/admin/DaftarJadwalGrid";
import { useProfile } from "../../hooks/useProfile";

export default function KelolaSesiPertemuan() {
  const { user } = useProfile();

  // Jika data user belum dimuat
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm animate-pulse">Memuat data dosen...</p>
      </div>
    );
  }

  return (
    <DaftarJadwalGrid 
      title="Kelola Sesi Pertemuan" 
      basePath="/dosen/kelola-sesi-pertemuan" 
      dosenNidn={user?.nomor_induk}
      isDosenView={true}
    />
  );
}
