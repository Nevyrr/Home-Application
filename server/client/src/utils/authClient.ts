import { clearStoredSession, getAccessToken, getRefreshToken, isTokenExpired, storeSession } from "./session.ts";

export const AUTH_REDIRECT_ERROR = "__AUTH_REDIRECT__";

let refreshPromise: Promise<string> | null = null;

const redirectToLogin = (): never => {
  clearStoredSession();

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }

  throw new Error(AUTH_REDIRECT_ERROR);
};

const createRequestInit = (init: RequestInit, token: string): RequestInit => {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return {
    ...init,
    headers,
  };
};

const refreshSession = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return redirectToLogin();
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch("/api/users/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      let payload: any = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload) {
        return redirectToLogin();
      }

      const user = storeSession(payload);
      const nextToken = getAccessToken();

      if (!user.email || !nextToken) {
        return redirectToLogin();
      }

      return nextToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const getValidAccessToken = async (): Promise<string> => {
  const accessToken = getAccessToken();

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  return refreshSession();
};

export const fetchWithAuth = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  let accessToken = await getValidAccessToken();
  let response = await fetch(input, createRequestInit(init, accessToken));

  if (response.status !== 401) {
    return response;
  }

  accessToken = await refreshSession();
  response = await fetch(input, createRequestInit(init, accessToken));

  if (response.status === 401) {
    return redirectToLogin();
  }

  return response;
};
