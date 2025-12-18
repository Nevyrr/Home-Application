import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style/theme.css";
import "./style/app.css";
import { AppProvider } from "./contexts/AppContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

