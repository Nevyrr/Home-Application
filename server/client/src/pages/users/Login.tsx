import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../controllers/UsersController.ts";
import { useAuth } from "../../hooks/index.ts";
import { useErrorHandler } from "../../hooks/index.ts";
import Alert from "../../components/Alert.tsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, setError, handleAsyncOperation } = useErrorHandler();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleAsyncOperation(
      async () => {
        const userData = await loginUser(email, password);
        login({
          id: localStorage.getItem("id") || "",
          name: localStorage.getItem("name") || "",
          email: localStorage.getItem("email") || "",
          receiveEmail: localStorage.getItem("receiveEmail") === "true",
          isAdmin: localStorage.getItem("isAdmin") === "true",
        });
        navigate('/dashboard');
        return userData;
      },
      null
    );
  };

  // Handle navigate to register
  const handleRegister = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/register')
  };

  return (
    <section className="card">
      <h1 className="title">Login to your account</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn mx-auto">Login</button>
      </form>

      <button className="btn mt-2 mx-auto" onClick={handleRegister}>New ? Create an Account</button>

      {error && <Alert msg={error} setMsg={setError} />}
    </section>
  );
};

export default Login;

