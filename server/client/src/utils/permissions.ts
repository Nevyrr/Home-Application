import type { ManagedUser, User, UserAccessLevel, UserRole } from "../types/index.ts";

type UserLike = Pick<User, "isAdmin" | "accessLevel">;
type ManagedUserLike = Pick<ManagedUser, "isAdmin" | "accessLevel">;

const normalizeAccessLevel = (accessLevel?: UserAccessLevel | string | null): UserAccessLevel =>
  accessLevel === "readonly" ? "readonly" : "writable";

export const isUserAdmin = (user: Pick<User, "isAdmin"> | Pick<ManagedUser, "isAdmin">): boolean =>
  user.isAdmin === true || user.isAdmin === "true";

export const getUserAccessLevel = (user: UserLike | ManagedUserLike): UserAccessLevel =>
  normalizeAccessLevel(user.accessLevel);

export const getUserRole = (user: UserLike | ManagedUserLike): UserRole =>
  isUserAdmin(user) ? "admin" : getUserAccessLevel(user);

export const canUserWrite = (user: UserLike | ManagedUserLike): boolean =>
  isUserAdmin(user) || getUserAccessLevel(user) === "writable";

export const getUserRoleLabel = (user: UserLike | ManagedUserLike): string => {
  const role = getUserRole(user);
  return role === "admin" ? "Administrateur" : role === "readonly" ? "Lecture seule" : "Modification";
};
