/**
 * Context consolidé pour toute l'application
 * Remplace les 5 contexts séparés pour une meilleure organisation
 */

import { createContext, useState, useContext, ReactNode } from "react";
import { AppState, User, ShoppingDay, ReminderPost, CalendarEvent, Taco, Nono } from "../types/index.ts";
import { loadStoredUser } from "../utils/session.ts";

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

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";
const DEFAULT_TACO_BIRTH_DATE = "07/08/2022";
const DEFAULT_TACO_WEIGHT_KG = 16.7;

export const AppProvider = ({ children }: AppProviderProps) => {
  // User state
  const [user, setUser] = useState<User>(loadStoredUser());

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
    annualVaccineDate: "",
    annualVaccineReminder: "",
    birthDate: DEFAULT_TACO_BIRTH_DATE,
    weightKg: DEFAULT_TACO_WEIGHT_KG,
  });

  // Nono state
  const [nono, setNono] = useState<Nono>({
    birthDate: DEFAULT_NONO_BIRTH_DATE,
    checkupDate: "",
    checkupReminder: "",
    vaccineDate: "",
    vaccineReminder: "",
    vitaminReminder: "",
    administrativeReminder: "",
    notes: "",
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

    // Nono
    nono,
    setNono,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

