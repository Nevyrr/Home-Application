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
  checked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShoppingDay {
  _id: string;
  name: string;
  shoppingList: ShoppingPost[];
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
  dueTime?: string | null;
  amount?: number | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Taco {
  _id?: string;
  vermifugeDate: string;
  vermifugeReminder: string;
  vermifugeIntervalMonths?: number | null;
  antiPuceDate: string;
  antiPuceReminder: string;
  antiPuceIntervalMonths?: number | null;
  annualVaccineDate: string;
  annualVaccineReminder: string;
  annualVaccineIntervalMonths?: number | null;
  birthDate: string;
  weightKg: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Nono {
  _id?: string;
  birthDate: string;
  checkupDate: string;
  vaccineDate: string;
  vaccineReminder: string;
  vaccineIntervalMonths?: number | null;
  notes: string;
  bottleEntries: NonoBottleEntry[];
  weightEntries: NonoWeightEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NonoBottleEntry {
  _id?: string;
  date?: string;
  timestamp?: string;
  amountMl: number;
}

export interface NonoWeightEntry {
  _id?: string;
  date: string;
  weightKg: number;
}

export interface AppState {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  shoppingItems: ShoppingDay[];
  setShoppingItems: Dispatch<SetStateAction<ShoppingDay[]>>;
  reminderPosts: ReminderPost[];
  setReminderPosts: Dispatch<SetStateAction<ReminderPost[]>>;
  taco: Taco;
  setTaco: Dispatch<SetStateAction<Taco>>;
  nono: Nono;
  setNono: Dispatch<SetStateAction<Nono>>;
}

