import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("user_token");
  const userRole = localStorage.getItem("user_role");

  if (!token) {
    return <Navigate to={allowedRole === "admin" ? "/login-admin" : "/login"} replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}

