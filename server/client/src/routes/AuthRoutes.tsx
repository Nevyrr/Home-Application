import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/index.ts";

const AuthRoutes = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthRoutes;

