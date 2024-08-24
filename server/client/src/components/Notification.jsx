import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

const Notification = ({ msg, setMsg, icon, color, timer }) => {
  const [show, setShow] = useState(true);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (msg) {
      setShow(true); // Afficher la notification

      if (msg === "jwt expired") {
        // TODO This is not a good way to do it
        setUser({ email: null });
        // Remove the items from local storage
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        // Navigate to ShoppingTab page
        navigate("/shopping");
      }

      // Réglage du délai pour masquer la notification
      const timeout = setTimeout(() => {
        setShow(false);
        setMsg("");
      }, timer);

      // Nettoyage de l'effet lorsque le message change ou le composant se démonte
      return () => clearTimeout(timeout);
    }
  }, [msg, timer]); // Dépendances : réexécuter lorsque msg ou timer change

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
