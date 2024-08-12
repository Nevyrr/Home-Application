import { useContext, useState } from "react";
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

  const highlightIcon = (elementName) => {
    // Chercher le bouton dans le DOM en utilisant la classe
    const button = document.querySelector('.' + "fa-solid" + '.' + elementName);

    if (button) {
      if (button.classList.contains('animate-highlight')) {
        button.classList.remove('animate-highlight');
        void button.offsetWidth; // Reflow for class deletion to be effective
      }
      button.classList.add('animate-highlight');
    }
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

      <span className="title mt-12 block">Highlight multiple boards :</span>
      <div className="grid grid-cols-4 gap-4">
        <button className="btn m-auto" onClick={() => { highlightIcon("shopping") }}>Shopping</button>
        <button className="btn m-auto" onClick={() => { highlightIcon("calendar") }}>Calendar</button>
        <button className="btn m-auto" onClick={() => { highlightIcon("bell") }}>Reminders</button>
        <button className="btn m-auto" onClick={() => { highlightIcon("taco") }}>Taco</button>
      </div>

    </section>
  );
};

export default Dashboard;
