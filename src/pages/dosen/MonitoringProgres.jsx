import DaftarJadwalGrid from "../../components/admin/DaftarJadwalGrid";
import { useProfile } from "../../hooks/useProfile";

export default function MonitoringProgres() {
  const { user } = useProfile();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm animate-pulse">Memuat data dosen...</p>
      </div>
    );
  }

  return (
    <DaftarJadwalGrid 
      title="Monitoring Progres" 
      basePath="/dosen/monitoring-progres" 
      dosenNidn={user?.nomor_induk}
      isDosenView={true}
    />
  );
}
