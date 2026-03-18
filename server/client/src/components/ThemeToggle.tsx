import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = "theme-toggle" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={className}
      title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <i className="fa-solid fa-moon"></i>
      ) : (
        <i className="fa-solid fa-sun"></i>
      )}
    </button>
  );
};

export default ThemeToggle;

