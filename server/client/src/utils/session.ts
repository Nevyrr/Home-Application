import { jwtDecode } from "jwt-decode";
import { User, UserAccessLevel, UserRole } from "../types/index.ts";

interface DecodedToken {
  _id?: string;
  exp?: number;
}

export interface SessionResponse {
  token?: string;
  refreshToken?: string;
  name?: string;
  email?: string;
  receiveEmail?: boolean;
  isAdmin?: boolean;
  accessLevel?: UserAccessLevel;
  role?: UserRole;
  data?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      receiveEmail?: boolean;
      isAdmin?: boolean;
      accessLevel?: UserAccessLevel;
      role?: UserRole;
    };
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
}

const STORAGE_KEYS = {
  accessToken: "token",
  refreshToken: "refreshToken",
  id: "id",
  name: "name",
  email: "email",
  receiveEmail: "receiveEmail",
  isAdmin: "isAdmin",
  accessLevel: "accessLevel",
  role: "role",
} as const;

export const emptyUser = (): User => ({
  id: null,
  name: null,
  email: null,
  receiveEmail: null,
  isAdmin: null,
  accessLevel: null,
  role: null,
});

export const getAccessToken = (): string | null => localStorage.getItem(STORAGE_KEYS.accessToken);

export const getRefreshToken = (): string | null => localStorage.getItem(STORAGE_KEYS.refreshToken);

export const clearStoredSession = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const loadStoredUser = (): User => ({
  id: localStorage.getItem(STORAGE_KEYS.id),
  name: localStorage.getItem(STORAGE_KEYS.name),
  email: localStorage.getItem(STORAGE_KEYS.email),
  receiveEmail: localStorage.getItem(STORAGE_KEYS.receiveEmail),
  isAdmin: localStorage.getItem(STORAGE_KEYS.isAdmin),
  accessLevel: (localStorage.getItem(STORAGE_KEYS.accessLevel) as UserAccessLevel | null) || null,
  role: (localStorage.getItem(STORAGE_KEYS.role) as UserRole | null) || null,
});

export const hasStoredSession = (): boolean => !!loadStoredUser().email && !!getRefreshToken();

const persistStoredUser = (user: User): User => {
  localStorage.setItem(STORAGE_KEYS.id, user.id || "");
  localStorage.setItem(STORAGE_KEYS.name, user.name || "");
  localStorage.setItem(STORAGE_KEYS.email, user.email || "");
  localStorage.setItem(STORAGE_KEYS.receiveEmail, String(user.receiveEmail ?? false));
  localStorage.setItem(STORAGE_KEYS.isAdmin, String(user.isAdmin ?? false));
  localStorage.setItem(STORAGE_KEYS.accessLevel, user.accessLevel || "writable");
  localStorage.setItem(STORAGE_KEYS.role, user.role || "writable");

  return loadStoredUser();
};

export const updateStoredUser = (
  patch: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    receiveEmail?: boolean | string | null;
    isAdmin?: boolean | string | null;
    accessLevel?: UserAccessLevel | null;
    role?: UserRole | null;
  }
): User => {
  const currentUser = loadStoredUser();

  return persistStoredUser({
    id: patch.id ?? currentUser.id,
    name: patch.name ?? currentUser.name,
    email: patch.email ?? currentUser.email,
    receiveEmail:
      patch.receiveEmail !== undefined ? String(patch.receiveEmail) : currentUser.receiveEmail,
    isAdmin: patch.isAdmin !== undefined ? String(patch.isAdmin) : currentUser.isAdmin,
    accessLevel: patch.accessLevel ?? currentUser.accessLevel ?? "writable",
    role: patch.role ?? currentUser.role ?? "writable",
  });
};

const decodeToken = (token: string | null): DecodedToken | null => {
  if (!token) {
    return null;
  }

  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null, bufferSeconds = 30): boolean => {
  const decoded = decodeToken(token);

  if (!decoded?.exp) {
    return true;
  }

  return decoded.exp * 1000 <= Date.now() + bufferSeconds * 1000;
};

export const storeSession = (response: SessionResponse): User => {
  const accessToken = response.data?.tokens?.accessToken || response.token;
  const refreshToken = response.data?.tokens?.refreshToken || response.refreshToken;
  const decoded = decodeToken(accessToken || null);
  const sessionUser = response.data?.user;
  const currentUser = loadStoredUser();

  if (!accessToken || !refreshToken) {
    throw new Error("Tokens de session manquants");
  }

  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);

  return persistStoredUser({
    id: sessionUser?.id || currentUser.id || decoded?._id || "",
    name: sessionUser?.name || response.name || currentUser.name || "",
    email: sessionUser?.email || response.email || currentUser.email || "",
    receiveEmail: String(sessionUser?.receiveEmail ?? response.receiveEmail ?? currentUser.receiveEmail ?? false),
    isAdmin: String(sessionUser?.isAdmin ?? response.isAdmin ?? currentUser.isAdmin ?? false),
    accessLevel: sessionUser?.accessLevel || response.accessLevel || currentUser.accessLevel || "writable",
    role: sessionUser?.role || response.role || currentUser.role || "writable",
  });
};
