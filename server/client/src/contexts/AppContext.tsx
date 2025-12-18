/**
 * Context consolidé pour toute l'application
 * Remplace les 5 contexts séparés pour une meilleure organisation
 */

import { createContext, useState, useContext, ReactNode } from "react";
import { AppState, User, ShoppingDay, ReminderPost, CalendarEvent, Taco } from "../types/index.ts";

const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  // User state
  const [user, setUser] = useState<User>({
    id: localStorage.getItem("id"),
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    receiveEmail: localStorage.getItem("receiveEmail"),
    isAdmin: localStorage.getItem("isAdmin"),
  });

  // Shopping state
  const [shoppingItems, setShoppingItems] = useState<ShoppingDay[]>([]);

  // Reminder state
  const [reminderPosts, setReminderPosts] = useState<ReminderPost[]>([]);

  // Calendar events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Taco state
  const [taco, setTaco] = useState<Taco>({
    vermifugeDate: "",
    vermifugeReminder: "",
    antiPuceDate: "",
    antiPuceReminder: "",
  });

  const value: AppState = {
    // User
    user,
    setUser,
    
    // Shopping
    shoppingItems,
    setShoppingItems,
    
    // Reminder
    reminderPosts,
    setReminderPosts,
    
    // Calendar
    events,
    setEvents,
    
    // Taco
    taco,
    setTaco,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

