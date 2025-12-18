/**
 * Hook personnalisé pour la gestion de l'authentification
 */

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export const useAuth = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();

  const isAuthenticated = !!user.email;

  const login = (userData) => {
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      receiveEmail: userData.receiveEmail,
      isAdmin: userData.isAdmin,
    });
  };

  const logout = () => {
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

