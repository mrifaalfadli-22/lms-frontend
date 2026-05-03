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
import DosenDashboard from "./pages/dosen/Dashboard";
import KelolaJadwalPerkuliahan from "./pages/dosen/KelolaJadwalPerkuliahan";
import MonitoringProgres from "./pages/dosen/MonitoringProgres";
import ForumDiskusiMahasiswa from "./pages/dosen/ForumDiskusi";
import VerifikasiSertifikat from "./pages/dosen/VerifikasiSertifikat";

import AdminDashboard from "./pages/admin/Dashboard";
import KelolaPengguna from "./pages/admin/KelolaPengguna";
import KelolaMataKuliah from "./pages/admin/KelolaMataKuliah";
import ForumDiskusi from "./pages/admin/ForumDiskusi";
import KelolaSertifikat from "./pages/admin/KelolaSertifikat";
import VerifikasiDosen from "./pages/admin/VerifikasiDosen";

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
            path="kelola-jadwal-perkuliahan"
            element={<KelolaJadwalPerkuliahan />}
          />
          <Route path="monitoring-progres" element={<MonitoringProgres />} />
          <Route path="forum-diskusi" element={<ForumDiskusiMahasiswa />} />
          <Route
            path="verifikasi-sertifikat"
            element={<VerifikasiSertifikat />}
          />
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
          <Route path="kelola-mata-kuliah" element={<KelolaMataKuliah />} />
          <Route path="forum-diskusi" element={<ForumDiskusi />} />
          <Route path="kelola-sertifikat" element={<KelolaSertifikat />} />
          <Route path="verifikasi-dosen" element={<VerifikasiDosen />} />
        </Route>

        {/* Catch All - Jika user nyasar ke URL yang tidak ada */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
