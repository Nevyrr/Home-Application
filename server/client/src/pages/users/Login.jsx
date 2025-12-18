import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../controllers/UsersController";
import { useAuth } from "../../hooks";
import { useErrorHandler } from "../../hooks";
import Alert from "../../components/Alert";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, setError, handleAsyncOperation } = useErrorHandler();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    await handleAsyncOperation(
      async () => {
        const userData = await loginUser(email, password);
        login({
          id: localStorage.getItem("id"),
          name: localStorage.getItem("name"),
          email: localStorage.getItem("email"),
          receiveEmail: localStorage.getItem("receiveEmail"),
          isAdmin: localStorage.getItem("isAdmin"),
        });
        navigate('/dashboard');
        return userData;
      },
      null
    );
  };

  // Handle navigate to register
  const handleRegister = async (e) => {
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
