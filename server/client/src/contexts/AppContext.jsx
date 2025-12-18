/**
 * Context consolidé pour toute l'application
 * Remplace les 5 contexts séparés pour une meilleure organisation
 */

import { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState({
    id: localStorage.getItem("id"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    receiveEmail: localStorage.getItem("receiveEmail"),
    isAdmin: localStorage.getItem("isAdmin"),
  });

  // Shopping state
  const [shoppingItems, setShoppingItems] = useState([]);

  // Reminder state
  const [reminderPosts, setReminderPosts] = useState([]);

  // Calendar events state
  const [events, setEvents] = useState([]);

  // Taco state
  const [taco, setTaco] = useState({
    vermifugeDate: "",
    vermifugeReminder: "",
    antiPuceDate: "",
    antiPuceReminder: "",
  });

  const value = {
    // User
    user,
    setUser,
    
    // Shopping
    shoppingItems,
    setShoppingItems,
    
    // Reminders
    reminderPosts,
    setReminderPosts,
    
    // Calendar
    events,
    setEvents,
    
    // Taco
    taco,
    setTaco,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;

