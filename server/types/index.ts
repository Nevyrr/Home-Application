import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  receiveEmail: boolean;
  isAdmin: boolean;
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShoppingPost {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  username: string;
  title: string;
  count: number;
  unit?: string;
  priorityColor: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShoppingDay extends Document {
  _id: Types.ObjectId;
  date: string;
  name: string;
  shoppingList: IShoppingPost[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICalendarEvent extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  username: string;
  title: string;
  date: Date;
  duration?: string;
  priorityColor: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReminderPost extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  username: string;
  title: string;
  body: string;
  priorityColor: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaco extends Document {
  _id: Types.ObjectId;
  vermifugeDate: string;
  vermifugeReminder: string;
  antiPuceDate: string;
  antiPuceReminder: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

