import { Link, Outlet, useLocation } from "react-router-dom";
import Icon from "../components/Icon.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { useAuth } from "../hooks/index.ts";
import "../style/topbar.css";

const NAV_ITEMS = [
  { path: "/shopping", icon: "fa-cart-shopping", label: "Courses" },
  { path: "/calendar", icon: "fa-calendar-days", label: "Calendrier" },
  { path: "/reminders", icon: "fa-list-check", label: "Taches" },
  { path: "/taco", icon: "fa-dog", label: "Taco" },
  { path: "/nono", icon: "fa-baby", label: "Nono" },
];

const Layout = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isSelected = (path: string): boolean => {
    if (path === "/shopping" && pathname === "/") {
      return true;
    }

    return pathname === path;
  };

  return (
    <>
      <header className="topbar-shell">
        <nav className="topbar-nav">
          <div className="topbar-groups">
            <div className="topbar-main">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  title={item.label}
                  aria-label={item.label}
                  to={item.path}
                  className={`topbar-button ${isSelected(item.path) ? "is-active" : ""}`}
                  aria-current={isSelected(item.path) ? "page" : undefined}
                >
                  <i className={`fa-solid ${item.icon} nav-icon`}></i>
                </Link>
              ))}
            </div>

            <div className="topbar-utility">
              <ThemeToggle className="topbar-button topbar-theme-toggle" />

              {user.email ? (
                <>
                  <Link
                    title="Profil"
                    aria-label="Compte"
                    to="/dashboard"
                    className={`topbar-button ${isSelected("/dashboard") ? "is-active" : ""}`}
                    aria-current={isSelected("/dashboard") ? "page" : undefined}
                  >
                    <i className="fa-solid fa-circle-user nav-icon"></i>
                  </Link>
                  <button title="Deconnexion" aria-label="Quitter" onClick={() => logout()} className="topbar-button">
                    <i className="fa-solid fa-right-from-bracket nav-icon"></i>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    title="Connexion"
                    aria-label="Connexion"
                    to="/login"
                    className={`topbar-button ${isSelected("/login") ? "is-active" : ""}`}
                    aria-current={isSelected("/login") ? "page" : undefined}
                  >
                    <i className="fa-solid fa-right-to-bracket nav-icon"></i>
                  </Link>
                  <Link
                    title="Inscription"
                    aria-label="Inscription"
                    to="/register"
                    className={`topbar-button ${isSelected("/register") ? "is-active" : ""}`}
                    aria-current={isSelected("/register") ? "page" : undefined}
                  >
                    <i className="fa-solid fa-user-plus nav-icon"></i>
                  </Link>
                </>
              )}
              <span className="topbar-brand-icon">
                <Icon imageName={"DavinIcon.png"} />
              </span>
            </div>
          </div>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
