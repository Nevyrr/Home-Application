import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../../components/index.ts";
import { registerUser, loginWithGoogle } from "../../controllers/UsersController.ts";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";
import { loadStoredUser } from "../../utils/session.ts";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, handleAsyncOperation } = useErrorHandler();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const syncUserFromStorage = () => {
    const storedUser = loadStoredUser();

    login({
      id: storedUser.id || "",
      name: storedUser.name || "",
      email: storedUser.email || "",
      receiveEmail: storedUser.receiveEmail === "true",
      isAdmin: storedUser.isAdmin === "true",
      accessLevel: storedUser.accessLevel || "writable",
    });
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await handleAsyncOperation(async () => {
      await registerUser(formData.name, formData.email, formData.password, formData.passwordConfirm);
      syncUserFromStorage();
      navigate("/dashboard");
    }, null);
  };

  const handleGoogleRegister = async (credential: string) => {
    await handleAsyncOperation(async () => {
      await loginWithGoogle(credential);
      syncUserFromStorage();
      navigate("/dashboard");
    }, null);
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Inscription</p>
        <h1>Centralise les routines du foyer.</h1>
        <p>
          Cree ton espace, partage les taches utiles et garde une vision plus propre de ce qui doit etre fait. Si tu
          veux aller vite, l'inscription Google est disponible juste en dessous.
        </p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Nouveau compte</p>
        <h2>Creer un acces</h2>

        <GoogleSignInButton onCredential={handleGoogleRegister} text="signup_with" />

        <div className="divider-label">ou avec le formulaire</div>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nom"
            className="input"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            autoFocus
          />
          <input
            type="email"
            placeholder="Adresse email"
            className="input"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="input"
            value={formData.passwordConfirm}
            onChange={(event) => setFormData({ ...formData, passwordConfirm: event.target.value })}
          />
          <button className="btn">Creer mon compte</button>
        </form>

        <button className="ghost-button mt-3 w-full" onClick={() => navigate("/login")}>
          J'ai deja un compte
        </button>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default Register;
