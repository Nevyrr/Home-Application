import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../controllers/UsersController";
import { UserContext } from "../../contexts/UserContext";
import Alert from "../../components/Alert";

const Login = () => {
  // Use user context
  const { setUser } = useContext(UserContext);

  // Use navigate hook
  const navigate = useNavigate();

  // Error state
  const [error, setError] = useState(null);

  // Form data state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Login the user
      await loginUser(email, password);
      // Update the user state
      setUser({id: localStorage.getItem("id"), name: localStorage.getItem("name"), email:localStorage.getItem("email"), receiveEmail:localStorage.getItem("receiveEmail")});
      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      setError(error.message);
    }
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
        <button className="btn">Login</button>
      </form>

      <button className="btn w-1/4 mt-2 mx-auto" onClick={handleRegister}>New ? Create an Account</button>

      {error && <Alert msg={error} />}
    </section>
  );
};

export default Login;
