import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style/app.css";
import { AppProvider } from "./contexts/AppContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

