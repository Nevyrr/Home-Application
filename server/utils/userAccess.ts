import type { IUser, UserAccessLevel, UserRole } from "../types/index.js";
import { env } from "../config/env.js";

const DEFAULT_ACCESS_LEVEL: UserAccessLevel = "writable";

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const bootstrapAdminEmails = new Set(
  (env.DEFAULT_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean)
);

export const normalizeAccessLevel = (value?: string | null): UserAccessLevel =>
  value === "readonly" ? "readonly" : DEFAULT_ACCESS_LEVEL;

export const isBootstrapAdminEmail = (email?: string | null): boolean =>
  typeof email === "string" && bootstrapAdminEmails.has(normalizeEmail(email));

export const canUserWrite = (user: Pick<IUser, "isAdmin" | "accessLevel">): boolean =>
  Boolean(user.isAdmin) || normalizeAccessLevel(user.accessLevel) === "writable";

export const getUserRole = (user: Pick<IUser, "isAdmin" | "accessLevel">): UserRole =>
  user.isAdmin ? "admin" : normalizeAccessLevel(user.accessLevel);

export const syncUserAccessState = async <
  TUser extends Pick<IUser, "email" | "isAdmin" | "accessLevel"> & { save(): Promise<unknown> }
>(
  user: TUser
): Promise<TUser> => {
  let hasChanges = false;

  if (normalizeAccessLevel(user.accessLevel) !== user.accessLevel) {
    user.accessLevel = DEFAULT_ACCESS_LEVEL;
    hasChanges = true;
  }

  if (isBootstrapAdminEmail(user.email)) {
    if (!user.isAdmin) {
      user.isAdmin = true;
      hasChanges = true;
    }

    if (user.accessLevel !== "writable") {
      user.accessLevel = "writable";
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await user.save();
  }

  return user;
};

export const serializeUser = (
  user: Pick<IUser, "_id" | "name" | "email" | "receiveEmail" | "isAdmin" | "accessLevel" | "createdAt" | "updatedAt">
) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  receiveEmail: user.receiveEmail,
  isAdmin: user.isAdmin,
  accessLevel: normalizeAccessLevel(user.accessLevel),
  role: getUserRole(user),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
