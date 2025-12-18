import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/index.ts";

interface NotificationProps {
  msg: string;
  setMsg: (msg: string | null) => void;
  icon: string;
  color: string;
  timer: number;
}

const Notification = ({ msg, setMsg, icon, color, timer }: NotificationProps) => {
  const [show, setShow] = useState<boolean>(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (msg) {
      setShow(true);

      if (msg === "jwt expired") {
        // Déconnexion automatique si le token JWT a expiré
        logout();
        navigate("/shopping");
      }

      // Masquer la notification après le délai spécifié
      const timeout = setTimeout(() => {
        setShow(false);
        setMsg("");
      }, timer);

      // Nettoyage de l'effet lorsque le message change ou le composant se démonte
      return () => clearTimeout(timeout);
    }
  }, [msg, timer, logout, navigate, setMsg]);

  return (
    <div>
      {show && (
        <div className={color + " text-white p-2 rounded-md mt-6 text-sm mb-4 absolute left-1/4 top-6 w-1/2"}>
          <i className={icon + " fa-solid"}></i> {msg}
        </div>
      )}
    </div>
  );
};

export default Notification;

