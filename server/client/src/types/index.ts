import type { Dispatch, SetStateAction } from "react";

export type UserAccessLevel = "writable" | "readonly";
export type UserRole = "admin" | UserAccessLevel;

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  receiveEmail: string | null;
  isAdmin: string | null;
  accessLevel: UserAccessLevel | null;
  role?: UserRole | null;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  receiveEmail: boolean;
  isAdmin: boolean;
  accessLevel: UserAccessLevel;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingPost {
  _id: string;
  user: string;
  username: string;
  title: string;
  count: number;
  unit?: string;
  priorityColor: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingDay {
  _id: string;
  date: string;
  name: string;
  shoppingList: ShoppingPost[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  _id: string;
  user: string;
  username: string;
  title: string;
  date: Date | string;
  duration?: string;
  priorityColor: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReminderPost {
  _id: string;
  user: string;
  username: string;
  title: string;
  body: string;
  priorityColor: number;
  status: "todo" | "doing" | "done";
  dueDate?: string | Date | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExternalCalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  isAllDay: boolean;
  location?: string;
  htmlLink?: string;
}

export interface Taco {
  _id?: string;
  vermifugeDate: string;
  vermifugeReminder: string;
  antiPuceDate: string;
  antiPuceReminder: string;
  annualVaccineDate: string;
  annualVaccineReminder: string;
  birthDate: string;
  weightKg: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Nono {
  _id?: string;
  birthDate: string;
  checkupDate: string;
  checkupReminder: string;
  vaccineDate: string;
  vaccineReminder: string;
  vitaminReminder: string;
  administrativeReminder: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppState {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  shoppingItems: ShoppingDay[];
  setShoppingItems: Dispatch<SetStateAction<ShoppingDay[]>>;
  reminderPosts: ReminderPost[];
  setReminderPosts: Dispatch<SetStateAction<ReminderPost[]>>;
  events: CalendarEvent[];
  setEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  taco: Taco;
  setTaco: Dispatch<SetStateAction<Taco>>;
  nono: Nono;
  setNono: Dispatch<SetStateAction<Nono>>;
}

