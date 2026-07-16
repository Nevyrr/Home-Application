import { Link } from "react-router-dom";
import { useAuth } from "../hooks/index.ts";

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="card not-found-shell">
      <span className="not-found-badge">
        <i className="fa-solid fa-map-location-dot"></i>
      </span>

      <p className="eyebrow">Erreur 404</p>
      <h1 className="title">Cette page s'est perdue en chemin</h1>
      <p className="not-found-copy">
        La page que tu cherches n'existe pas ou a ete deplacee. Retourne a l'accueil pour continuer.
      </p>

      <Link to="/" className="btn not-found-button">
        {isAuthenticated ? "Retour a l'accueil" : "Retour a la connexion"}
      </Link>
    </section>
  );
};

export default NotFound;
