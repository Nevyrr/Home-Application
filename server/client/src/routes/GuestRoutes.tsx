import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/index.ts";

const GuestRoutes = () => {
  const { isAuthenticated } = useAuth();

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default GuestRoutes;

