import { jwtDecode } from "jwt-decode";
import { User } from "../types/index.ts";

interface DecodedToken {
  _id?: string;
  exp?: number;
}

interface SessionResponse {
  token?: string;
  refreshToken?: string;
  name?: string;
  email?: string;
  receiveEmail?: boolean;
  isAdmin?: boolean;
  data?: {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      receiveEmail?: boolean;
      isAdmin?: boolean;
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
} as const;

export const emptyUser = (): User => ({
  id: null,
  name: null,
  email: null,
  receiveEmail: null,
  isAdmin: null,
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
});

export const hasStoredSession = (): boolean => !!loadStoredUser().email && !!getRefreshToken();

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
  const decoded = decodeToken(accessToken);
  const sessionUser = response.data?.user;
  const currentUser = loadStoredUser();

  if (!accessToken || !refreshToken) {
    throw new Error("Tokens de session manquants");
  }

  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  localStorage.setItem(STORAGE_KEYS.id, sessionUser?.id || currentUser.id || decoded?._id || "");
  localStorage.setItem(STORAGE_KEYS.name, sessionUser?.name || response.name || currentUser.name || "");
  localStorage.setItem(STORAGE_KEYS.email, sessionUser?.email || response.email || currentUser.email || "");
  localStorage.setItem(
    STORAGE_KEYS.receiveEmail,
    String(sessionUser?.receiveEmail ?? response.receiveEmail ?? currentUser.receiveEmail ?? false)
  );
  localStorage.setItem(STORAGE_KEYS.isAdmin, String(sessionUser?.isAdmin ?? response.isAdmin ?? currentUser.isAdmin ?? false));

  return loadStoredUser();
};
