import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style/app.css";
import UserProvider from "./contexts/UserContext.jsx";
import ShoppingPostProvider from "./contexts/ShoppingPostContext.jsx";
import ReminderPostProvider from "./contexts/ReminderPostContext.jsx";
import CalendarEventProvider from "./contexts/CalendarEventContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <ShoppingPostProvider>
        <ReminderPostProvider>
          <CalendarEventProvider>
            <App />
          </CalendarEventProvider>
        </ReminderPostProvider>
      </ShoppingPostProvider>
    </UserProvider>
  </React.StrictMode>
);
