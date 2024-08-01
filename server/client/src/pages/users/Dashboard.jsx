import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { updateUser } from "../../controllers/UsersController";

const Dashboard = () => {
  // Use user context
  const { user, setUser } = useContext(UserContext);

  const handleCheckboxMailChange = () => {
    const newCheckBoxState = !getBooleanFromString(user.receiveEmail);
    setUser((user) => ({ id: user.id, name: user.name, email: user.email, receiveEmail: newCheckBoxState.toString() }));
    updateUser({ receiveEmail: newCheckBoxState });
  }

  const getBooleanFromString = (bool) => {
    return bool === "true"
  }

  return (
    <section className="card">
      <h1 className="title m-0">{user.name} Dashboard</h1>
      <p className="mb-4">{user.email}</p>
      <label className="flex items-center space-x-3">
        <input
          className="form-checkbox h-5 w-5 text-blue-600"
          type="checkbox"
          checked={getBooleanFromString(user.receiveEmail)}
          onChange={handleCheckboxMailChange}
        />
        <span className="text-gray-900">Receive emails from the application</span>
      </label>
    </section>
  );
};

export default Dashboard;
