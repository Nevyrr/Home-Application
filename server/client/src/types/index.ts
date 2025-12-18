export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  receiveEmail: string | null;
  isAdmin: string | null;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Taco {
  _id?: string;
  vermifugeDate: string;
  vermifugeReminder: string;
  antiPuceDate: string;
  antiPuceReminder: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppState {
  user: User;
  setUser: (user: User) => void;
  shoppingItems: ShoppingDay[];
  setShoppingItems: (items: ShoppingDay[]) => void;
  reminderPosts: ReminderPost[];
  setReminderPosts: (posts: ReminderPost[]) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
  taco: Taco;
  setTaco: (taco: Taco) => void;
}

