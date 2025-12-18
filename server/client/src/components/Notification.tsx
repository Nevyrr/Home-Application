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
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (msg) {
      setShow(true);
      // Petit délai pour l'animation d'entrée
      setTimeout(() => setIsVisible(true), 10);

      if (msg === "jwt expired") {
        // Déconnexion automatique si le token JWT a expiré
        logout();
        navigate("/shopping");
      }

      // Masquer la notification après le délai spécifié
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setShow(false);
          setMsg("");
        }, 300); // Délai pour l'animation de sortie
      }, timer);

      // Nettoyage de l'effet lorsque le message change ou le composant se démonte
      return () => clearTimeout(timeout);
    }
  }, [msg, timer, logout, navigate, setMsg]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShow(false);
      setMsg("");
    }, 300);
  };

  if (!show || !msg) return null;

  return (
    <div 
      className={`notification-snackbar fixed top-4 right-4 z-[9999] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}
      style={{
        width: '100%',
        maxWidth: 'min(400px, calc(100vw - 2rem))'
      }}
    >
      <div 
        className={`${color} text-white p-4 rounded-xl text-sm shadow-2xl flex items-center gap-3 border-2 border-white/20`}
        style={{
          backgroundColor: color === 'bg-red-500' ? '#ef4444' : color === 'bg-green-500' ? '#10b981' : 'var(--primary)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <i className={icon + " fa-solid text-xl flex-shrink-0"}></i>
        <span className="flex-1 font-medium">{msg}</span>
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Fermer la notification"
        >
          <i className="fa-solid fa-times text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default Notification;

