import { useState, useEffect } from "react";

const Notification = ({ msg, icon, color, timer }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (msg) {
      setShow(true); // Afficher la notification
  
      // Réglage du délai pour masquer la notification
      const timeout = setTimeout(() => {
        setShow(false);
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
