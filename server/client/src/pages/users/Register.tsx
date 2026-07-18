import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../controllers/UsersController.ts";
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
    registrationCode: "",
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
      await registerUser(formData.name, formData.email, formData.password, formData.passwordConfirm, formData.registrationCode);
      syncUserFromStorage();
      navigate("/dashboard");
    }, null).catch(() => undefined);
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Inscription</p>
        <h1>Centralise les routines du foyer.</h1>
        <p>
          Cree ton espace, partage les taches utiles et garde une vision plus propre de ce qui doit etre fait.
          L'inscription necessite le code d'invitation transmis par un administrateur du foyer.
        </p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Nouveau compte</p>
        <h2>Creer un acces</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nom"
            className="input"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            autoComplete="name"
            autoFocus
          />
          <input
            type="email"
            placeholder="Adresse email"
            className="input"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="input"
            value={formData.passwordConfirm}
            onChange={(event) => setFormData({ ...formData, passwordConfirm: event.target.value })}
            autoComplete="new-password"
          />
          <input
            type="text"
            placeholder="Code d'invitation"
            className="input"
            value={formData.registrationCode}
            onChange={(event) => setFormData({ ...formData, registrationCode: event.target.value })}
            autoComplete="off"
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
