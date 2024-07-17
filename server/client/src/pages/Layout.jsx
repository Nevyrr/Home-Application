import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { UserContext } from "../contexts/UserContext";

const Layout = () => {
  // Use navigate hook
  const navigate = useNavigate();

  // Grab the User global state
  const { user, setUser } = useContext(UserContext);

  // Handle logout
  const handleLogout = () => {
    if (confirm("Confirm Logout?")) {
      // Reset the User state
      setUser({ email: null, posts: [] });
      // Remove the items from local storage
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      // Navigate to ShoppingTab page
      navigate("/shopping");
    }
  };

  return (
    <>
      <header className="bg-indigo-500 text-white">
        <nav className="flex items-center justify-between p-4 max-w-screen-lg mx-auto">
          <Link
            title="Shopping"
            to="/shopping"
            className="fa-solid fa-cart-shopping nav-link"
          ></Link>

          <Link
            title="Calendar"
            to="/calendar"
            className="fa-solid fa-calendar-days nav-link"
          ></Link>

          <Link
            title="Reminders"
            to="/reminders"
            className="fa-solid fa-bell nav-link"
          ></Link>


          <Link
            title="Taco"
            to="/taco"
            className="fa-solid fa-dog nav-link"
          ></Link>


          {user.email ? (
            <div className="flex items-center gap-2">
              <Link
                title="Dashboard"
                to="/dashboard"
                className="fa-solid fa-circle-user nav-link"
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
        </nav>
      </header>

      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
