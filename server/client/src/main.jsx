import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style/app.css";
import UserProvider from "./contexts/UserContext.jsx";
import PostProvider from "./contexts/PostContext.jsx";
import CalendarEventProvider from "./contexts/CalendarEventContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <PostProvider>
        <CalendarEventProvider>
          <App />
        </CalendarEventProvider>
      </PostProvider>
    </UserProvider>
  </React.StrictMode>
);
