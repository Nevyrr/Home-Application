import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../../components/index.ts";
import { loginUser, loginWithGoogle } from "../../controllers/UsersController.ts";
import { useAuth, useErrorHandler } from "../../hooks/index.ts";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, setError, handleAsyncOperation } = useErrorHandler();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const syncUserFromStorage = () => {
    login({
      id: localStorage.getItem("id") || "",
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      receiveEmail: localStorage.getItem("receiveEmail") === "true",
      isAdmin: localStorage.getItem("isAdmin") === "true",
    });
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await handleAsyncOperation(async () => {
      await loginUser(email, password);
      syncUserFromStorage();
      navigate("/dashboard");
    }, null);
  };

  const handleGoogleLogin = async (credential: string) => {
    await handleAsyncOperation(async () => {
      await loginWithGoogle(credential);
      syncUserFromStorage();
      navigate("/dashboard");
    }, null);
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">Connexion</p>
        <h1>Organise la maison sans friction.</h1>
        <p>
          Courses, calendrier, rappels et suivi du quotidien restent au meme endroit. Tu peux maintenant utiliser
          ton compte Google pour entrer plus vite et connecter ton agenda.
        </p>
      </div>

      <div className="auth-card">
        <p className="eyebrow">Bon retour</p>
        <h2>Se connecter</h2>

        <GoogleSignInButton onCredential={handleGoogleLogin} text="continue_with" />

        <div className="divider-label">ou avec ton email</div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Adresse email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="btn">Connexion</button>
        </form>

        <button className="ghost-button mt-3 w-full" onClick={() => navigate("/register")}>
          Creer un compte
        </button>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default Login;
