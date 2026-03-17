/**
 * Hook personnalisÃ© pour la gestion de l'authentification
 */

import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext.tsx";
import { logoutUser } from "../controllers/UsersController.ts";
import { clearStoredSession, emptyUser, hasStoredSession } from "../utils/session.ts";

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

  const isAuthenticated = !!user.email && hasStoredSession();

  const login = (userData: LoginUserData): void => {
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      receiveEmail: String(userData.receiveEmail),
      isAdmin: String(userData.isAdmin),
    });
  };

  const logout = async (askConfirmation = true): Promise<void> => {
    if (askConfirmation && !confirm("Confirmer la dÃ©connexion ?")) {
      return;
    }

    try {
      await logoutUser();
    } catch {
      // Nettoyer l'Ã©tat local mÃªme si la session serveur a dÃ©jÃ  expirÃ©.
    }

    clearStoredSession();
    setUser(emptyUser());
    navigate("/login");
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};
