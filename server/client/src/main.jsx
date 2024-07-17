import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style/app.css";
import UserProvider from "./contexts/UserContext.jsx";
import PostProvider from "./contexts/PostContext.jsx";
import EventProvider from "./contexts/EventContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PostProvider>
      <EventProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </EventProvider>
    </PostProvider>
  </React.StrictMode>
);
