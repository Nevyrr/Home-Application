import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Icon from "../components/Icon.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { useAuth } from "../hooks/index.ts";

const Layout = () => {
  const { user, logout } = useAuth();
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  const handleLinkClick = (link: string): void => {
    setSelectedLink(link);
  };

  return (
    <>
      <header className="bg-header border-b border-theme shadow-theme-sm sticky top-0 z-50">
        <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto gap-3 px-6">
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
              <ThemeToggle />
              <Link
                title="Dashboard"
                to="/dashboard"
                className={`fa-solid fa-circle-user nav-link ${selectedLink === 'dashboard' ? 'selected' : ''}`}
                onClick={() => handleLinkClick('dashboard')}
              ></Link>
              <button
                title="Logout"
                onClick={logout}
                className="fa-solid fa-right-from-bracket nav-link"
              ></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
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

          <div className="flex items-center gap-3">
            <div className="max-w-20">
              <Icon imageName={"DavinIcon.png"} />
            </div>
          </div>
        </nav>
      </header>

      <main className="p-4 min-h-screen max-w-7xl mx-auto px-6">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;

