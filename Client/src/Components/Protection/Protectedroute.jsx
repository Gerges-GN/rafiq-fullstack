import { Navigate, Outlet } from "react-router-dom";

// Wrap any routes that require a logged-in user with this.
// Checks both storages since "Remember me" on Login.jsx decides which one is used.
export default function ProtectedRoute() {
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}