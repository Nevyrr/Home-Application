import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../controllers/UsersController.ts";
import { useAuth } from "../../hooks/index.ts";
import { useErrorHandler } from "../../hooks/index.ts";
import Alert from "../../components/Alert.tsx";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error, setError, handleAsyncOperation } = useErrorHandler();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleAsyncOperation(
      async () => {
        await registerUser(
          formData.name,
          formData.email,
          formData.password,
          formData.passwordConfirm
        );
        login({
          name: formData.name,
          email: formData.email,
          id: localStorage.getItem("id") || "",
          receiveEmail: localStorage.getItem("receiveEmail") === "true",
          isAdmin: localStorage.getItem("isAdmin") === "true",
        });
        navigate('/dashboard');
      },
      null
    );
  };
  return (
    <section className="card">
      <h1 className="title">Create a new account</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="name"
          className="input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          autoFocus
        />
        <input
          type="email"
          placeholder="Email Address"
          className="input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="input"
          value={formData.passwordConfirm}
          onChange={(e) =>
            setFormData({ ...formData, passwordConfirm: e.target.value })
          }
        />
        <button className="btn">Register</button>
      </form>

      {error && <Alert msg={error} setMsg={setError} />}
    </section>
  );
};

export default Register;

