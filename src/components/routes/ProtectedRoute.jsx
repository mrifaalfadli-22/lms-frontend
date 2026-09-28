import { Navigate } from "react-router-dom";
import RedirectToEportal from "../../pages/auth/RedirectToEportal";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("user_token");
  const userRole = localStorage.getItem("user_role");

  if (!token) return <RedirectToEportal />;

  if (userRole !== allowedRole) {
    // Jika dosen coba masuk ke admin, lempar balik ke dashboard dosen
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}
