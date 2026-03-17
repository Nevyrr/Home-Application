import { Link, Outlet, useLocation } from "react-router-dom";
import Icon from "../components/Icon.tsx";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { useAuth } from "../hooks/index.ts";

const NAV_ITEMS = [
  { path: "/shopping", icon: "fa-cart-shopping", label: "Shopping" },
  { path: "/calendar", icon: "fa-calendar-days", label: "Calendrier" },
  { path: "/reminders", icon: "fa-list-check", label: "Todo" },
  { path: "/taco", icon: "fa-dog", label: "Taco" },
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
      <header className="app-header">
        <nav className="app-nav">
          <Link to="/shopping" className="brand-lockup">
            <div className="brand-icon-shell">
              <Icon imageName={"DavinIcon.png"} />
            </div>
            <div className="brand-copy">
              <span className="brand-eyebrow">Davin home application</span>
              <strong>Home Base</strong>
            </div>
          </Link>

          <div className="nav-cluster">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                title={item.label}
                to={item.path}
                className={`nav-link ${isSelected(item.path) ? "selected" : ""}`}
              >
                <i className={`fa-solid ${item.icon} nav-icon`}></i>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <ThemeToggle />

            {user.email ? (
              <>
                <Link
                  title="Dashboard"
                  to="/dashboard"
                  className={`nav-link compact ${isSelected("/dashboard") ? "selected" : ""}`}
                >
                  <i className="fa-solid fa-circle-user nav-icon"></i>
                  <span className="nav-label">Compte</span>
                </Link>
                <button title="Logout" onClick={() => logout()} className="nav-link compact">
                  <i className="fa-solid fa-right-from-bracket nav-icon"></i>
                  <span className="nav-label">Quitter</span>
                </button>
              </>
            ) : (
              <>
                <Link title="Login" to="/login" className={`nav-link compact ${isSelected("/login") ? "selected" : ""}`}>
                  <i className="fa-solid fa-right-to-bracket nav-icon"></i>
                  <span className="nav-label">Connexion</span>
                </Link>
                <Link
                  title="Register"
                  to="/register"
                  className={`nav-link compact ${isSelected("/register") ? "selected" : ""}`}
                >
                  <i className="fa-solid fa-user-plus nav-icon"></i>
                  <span className="nav-label">Inscription</span>
                </Link>
              </>
            )}
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
