import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../controllers/UsersController";
import { UserContext } from "../../contexts/UserContext";
import Alert from "../../components/Alert";


const Register = () => {
  // Use user context
  const { setUser } = useContext(UserContext)

  // Use navigate hook
  const navigate = useNavigate()

  // Error state
  const [error, setError] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  // Handle login
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Register the user
      await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirm
      );
      // Update the user state
      setUser({name: formData.name, email: formData.email, posts: []})
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <section className="card">
      <h1 className="title">Create a new account</h1>

      <form onSubmit={handleRegister}>
      <input
          type="name"
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
          autoFocus
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

      {error && <Alert msg={error} />}
    </section>
  );
};

export default Register;
