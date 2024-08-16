import { useContext, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

import { UserContext } from "../contexts/UserContext";

const Layout = () => {
  // Use navigate hook
  const navigate = useNavigate();

  // Grab the User global state
  const { user, setUser } = useContext(UserContext);
  const [selectedLink, setSelectedLink] = useState(null);

  const handleLinkClick = (link) => {
    setSelectedLink(link);
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm("Confirm Logout?")) {
      // Reset the User state
      setUser({ email: null });
      // Remove the items from local storage
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      // Navigate to ShoppingTab page
      navigate("/shopping");
    }
  };

  return (
    <>
      <header className="bg-indigo-600 text-white">
        <nav className="flex items-center justify-between p-4 max-w-screen-lg mx-auto">
          <Link
            title="Shopping"
            to="/shopping"
            className={`fa-solid shopping fa-cart-shopping nav-link ${selectedLink === 'shopping' ? 'selected' : ''}`}
            onClick={() => handleLinkClick('shopping')}
          ></Link>

          <Link
            title="Calendar"
            to="/calendar"
            className={`fa-solid calendar fa-calendar-days nav-link ${selectedLink === 'calendar' ? 'selected' : ''}`}
            onClick={() => handleLinkClick('calendar')}
          ></Link>

          <Link
            title="Reminders"
            to="/reminders"
            className={`fa-solid bell fa-bell nav-link ${selectedLink === 'reminders' ? 'selected' : ''}`}
            onClick={() => handleLinkClick('reminders')}
          ></Link>


          <Link
            title="Taco"
            to="/taco"
            className={`fa-solid taco fa-dog nav-link ${selectedLink === 'taco' ? 'selected' : ''}`}
            onClick={() => handleLinkClick('taco')}
          ></Link>


          {user.email ? (
            <div className="flex items-center gap-2">
              <Link
                title="Dashboard"
                to="/dashboard"
                className={`fa-solid fa-circle-user nav-link ${selectedLink === 'dashboard' ? 'selected' : ''}`}
                onClick={() => handleLinkClick('dashboard')}
              ></Link>
              <button
                title="Logout"
                onClick={handleLogout}
                className="fa-solid fa-right-from-bracket nav-link"
              ></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                title="Login"
                to="/login"
                className="fa-solid fa-right-to-bracket nav-link"
              ></Link>
              <Link
                title="Register"
                to="/register"
                className="fa-solid fa-user-plus nav-link"
              ></Link>
            </div>
          )}

          <div className="max-w-20">
            <Icon imageName={"DavinIcon.png"} />
          </div>
        </nav>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
