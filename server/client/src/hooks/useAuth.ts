/**
 * Hook personnalisé pour la gestion de l'authentification
 */

import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext.tsx";
import { User } from "../types/index.ts";

interface LoginUserData {
  id: string;
  name: string;
  email: string;
  receiveEmail: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();

  const isAuthenticated = !!user.email;

  const login = (userData: LoginUserData): void => {
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      receiveEmail: String(userData.receiveEmail),
      isAdmin: String(userData.isAdmin),
    });
  };

  const logout = (): void => {
    if (confirm("Confirmer la déconnexion ?")) {
      setUser({
        id: null,
        name: null,
        email: null,
        receiveEmail: null,
        isAdmin: null,
      });
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("name");
      localStorage.removeItem("receiveEmail");
      localStorage.removeItem("isAdmin");
      navigate("/shopping");
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};

