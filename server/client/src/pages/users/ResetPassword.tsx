import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../controllers/UsersController.ts";
import { useErrorHandler } from "../../hooks/index.ts";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);
  const { error, success, setError, handleAsyncOperation } = useErrorHandler();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Le lien de reinitialisation est incomplet");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);

    try {
      await handleAsyncOperation(async () => {
        await resetPassword(token, password);
      }, "Mot de passe reinitialise");

      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Nouveau mot de passe</p>
        <h1>Choisis un nouveau mot de passe.</h1>
        <p>Renseigne deux fois ton nouveau mot de passe pour finaliser la reinitialisation.</p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Reinitialisation</p>
        <h2>Definir un nouveau mot de passe</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="input"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
          <button className="btn" disabled={isSubmitting || !token}>
            {isSubmitting ? "Validation..." : "Mettre a jour le mot de passe"}
          </button>
        </form>

        <Link className="ghost-button mt-3 block w-full text-center" to="/login">
          Retour a la connexion
        </Link>

        {!token && <p className="mt-4 text-sm text-red-500">Token de reinitialisation manquant.</p>}
        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default ResetPassword;
