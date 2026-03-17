import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

  useEffect(() => {
    if (msg) {
      setShow(true);
      setTimeout(() => setIsVisible(true), 10);

      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setShow(false);
          setMsg("");
        }, 300);
      }, timer);

      return () => clearTimeout(timeout);
    }
  }, [msg, timer, setMsg]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShow(false);
      setMsg("");
    }, 300);
  };

  if (!show || !msg || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`notification-snackbar fixed top-4 right-4 transition-all duration-300 ease-out ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      }`}
      style={{
        width: "100%",
        maxWidth: "min(420px, calc(100vw - 2rem))",
        zIndex: 2147483647,
        pointerEvents: "none",
      }}
    >
      <div
        className={`${color} text-white p-4 rounded-xl text-sm shadow-2xl flex items-center gap-3 border-2 border-white/20`}
        style={{
          backgroundColor:
            color === "bg-red-500" ? "#ef4444" : color === "bg-green-500" ? "#10b981" : "var(--primary)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          pointerEvents: "auto",
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
    </div>,
    document.body
  );
};

export default Notification;
