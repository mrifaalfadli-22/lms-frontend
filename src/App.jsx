import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Import ProtectedRoute
import ProtectedRoute from "./components/routes/ProtectedRoute";

import AuthLayout from "./layouts/auth/AuthLayout";
import AdminDashboardLayout from "./layouts/admin/DashboardLayout";
import DosenDashboardLayout from "./layouts/dosen/DashboardLayout";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegistrasiForm";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthCallback from "./pages/auth/AuthCallback";
import DosenDashboard from "./pages/dosen/Dashboard";
import KelolaSesiPertemuan from "./pages/dosen/KelolaSesiPertemuan";
import DetailSesiKelas from "./pages/dosen/DetailSesiKelas";
import DetailPertemuanTabs from "./pages/dosen/DetailPertemuanTabs";
import MonitoringProgres from "./pages/dosen/MonitoringProgres";
import DetailMonitoringProgres from "./pages/dosen/DetailMonitoringProgres";
import ForumDiskusiMahasiswa from "./pages/dosen/ForumDiskusi";
import VerifikasiSertifikat from "./pages/dosen/VerifikasiSertifikat";
import HasilEvaluasi from "./pages/dosen/HasilEvaluasi";
import ProfilDosen from "./pages/dosen/ProfilDosen";

import AdminDashboard from "./pages/admin/Dashboard";
import KelolaPengguna from "./pages/admin/KelolaPengguna";
import KelolaKelas from "./pages/admin/KelolaKelas";
import KelolaMataKuliah from "./pages/admin/KelolaMataKuliah";
import KelolaJadwalKuliah from "./pages/admin/KelolaJadwalKuliah";
import KelolaMateriPerkuliahan from "./pages/admin/KelolaMateriPerkuliahan";
import ForumDiskusi from "./pages/admin/ForumDiskusi";
import KelolaSertifikat from "./pages/admin/KelolaSertifikat";
import VerifikasiDosen from "./pages/admin/VerifikasiDosen";
import ProfilAdmin from "./pages/admin/ProfilAdmin";
import KelolaEvaluasi from "./pages/admin/KelolaEvaluasi";
import DetailKelasDummy from "./components/admin/DetailKelasDummy";
import DetailForumDiskusiDummy from "./components/admin/DetailForumDiskusiDummy";
import DetailMateriDummy from "./components/admin/DetailMateriDummy";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Alur Otomatis ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 2. Grouping Halaman Authentication (Public) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginForm role="dosen" />} />
          <Route path="/login-admin" element={<LoginForm role="admin" />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>

        {/* 3. Grouping Halaman Dashboard Dosen (Protected) */}
        <Route
          path="/dosen"
          element={
            <ProtectedRoute allowedRole="dosen">
              <DosenDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DosenDashboard />} />
          <Route
            path="kelola-sesi-pertemuan"
            element={<KelolaSesiPertemuan />}
          />
          <Route
            path="kelola-sesi-pertemuan/:id"
            element={<DetailKelasDummy title="Detail Kelas Mata Kuliah" backTo="/dosen/kelola-sesi-pertemuan" />}
          />
          <Route
            path="kelola-sesi-pertemuan/:id/kelas/:kelasId"
            element={<DetailSesiKelas />}
          />
          <Route
            path="kelola-sesi-pertemuan/:id/kelas/:kelasId/pertemuan/:pertemuanId"
            element={<DetailPertemuanTabs />}
          />
          <Route path="monitoring-progres" element={<MonitoringProgres />} />
          <Route
            path="monitoring-progres/:id"
            element={<DetailKelasDummy title="Detail Kelas Mata Kuliah" backTo="/dosen/monitoring-progres" />}
          />
          <Route
            path="monitoring-progres/:id/kelas/:kelasId"
            element={<DetailMonitoringProgres />}
          />
          <Route path="forum-diskusi" element={<ForumDiskusiMahasiswa />} />
          <Route
            path="verifikasi-sertifikat"
            element={<VerifikasiSertifikat />}
          />
          <Route path="hasil-evaluasi" element={<HasilEvaluasi />} />
          <Route path="profil" element={<ProfilDosen />} />
        </Route>

        {/* 4. Grouping Halaman Admin (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="kelola-pengguna" element={<KelolaPengguna />} />
          <Route path="kelola-kelas" element={<KelolaKelas />} />
          <Route path="kelola-mata-kuliah" element={<KelolaMataKuliah />} />
          <Route
            path="kelola-jadwal-perkuliahan"
            element={<KelolaJadwalKuliah />}
          />
          <Route
            path="kelola-materi-perkuliahan"
            element={<KelolaMateriPerkuliahan />}
          />
          <Route
            path="kelola-materi-perkuliahan/:id"
            element={<DetailKelasDummy title="Kelola Materi Perkuliahan" backTo="/admin/kelola-materi-perkuliahan" />}
          />
          <Route
            path="kelola-materi-perkuliahan/:id/kelas/:kelasId"
            element={<DetailMateriDummy />}
          />
          <Route path="forum-diskusi" element={<ForumDiskusi />} />
          <Route 
            path="forum-diskusi/:id" 
            element={<DetailKelasDummy title="Forum Diskusi" backTo="/admin/forum-diskusi" />} 
          />
          <Route
            path="forum-diskusi/:id/kelas/:kelasId"
            element={<DetailForumDiskusiDummy />}
          />
          <Route path="kelola-sertifikat" element={<KelolaSertifikat />} />
          <Route path="kelola-evaluasi" element={<KelolaEvaluasi />} />
          <Route path="verifikasi-dosen" element={<VerifikasiDosen />} />
          <Route path="profil" element={<ProfilAdmin />} />
        </Route>

        {/* Catch All - Jika user nyasar ke URL yang tidak ada */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
