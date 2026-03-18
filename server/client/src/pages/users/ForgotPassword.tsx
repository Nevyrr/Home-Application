import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../controllers/UsersController.ts";
import { useErrorHandler } from "../../hooks/index.ts";

const ForgotPassword = () => {
  const { error, success, handleAsyncOperation } = useErrorHandler();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await handleAsyncOperation(async () => {
        await requestPasswordReset(email);
      }, "Si un compte existe pour cette adresse, un lien de reinitialisation a ete envoye.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Mot de passe oublie</p>
        <h1>Recupere l'acces a ton compte.</h1>
        <p>Entre ton adresse email. Si un compte existe, un lien de reinitialisation te sera envoye.</p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Reinitialisation</p>
        <h2>Recevoir un lien</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Adresse email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus
          />
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <Link className="ghost-button mt-3 block w-full text-center" to="/login">
          Retour a la connexion
        </Link>

        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default ForgotPassword;
