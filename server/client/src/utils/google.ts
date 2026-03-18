const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const GOOGLE_ACCESS_TOKEN_KEY = "googleCalendarAccessToken";
const GOOGLE_ACCESS_TOKEN_EXPIRY_KEY = "googleCalendarAccessTokenExpiry";

let googleScriptPromise: Promise<void> | null = null;

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  isAllDay: boolean;
  location?: string;
  htmlLink?: string;
}

const getGoogleClientId = (): string => import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

export const isGoogleConfigured = (): boolean => !!getGoogleClientId();

export const loadGoogleIdentityScript = async (): Promise<void> => {
  if (!isGoogleConfigured()) {
    throw new Error("Google n'est pas configure sur cette application");
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

      if (existingScript) {
        if (window.google?.accounts) {
          resolve();
        } else {
          existingScript.addEventListener("load", () => resolve(), { once: true });
          existingScript.addEventListener("error", () => reject(new Error("Impossible de charger Google")), {
            once: true,
          });
        }
        return;
      }

      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Impossible de charger Google"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

const setStoredGoogleCalendarToken = (accessToken: string, expiresIn: number): void => {
  localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(GOOGLE_ACCESS_TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
};

export const clearGoogleCalendarSession = (): void => {
  localStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_ACCESS_TOKEN_EXPIRY_KEY);
};

export const getStoredGoogleCalendarToken = (): string | null => {
  const accessToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
  const expiry = Number(localStorage.getItem(GOOGLE_ACCESS_TOKEN_EXPIRY_KEY) || "0");

  if (!accessToken || !expiry || expiry <= Date.now()) {
    clearGoogleCalendarSession();
    return null;
  }

  return accessToken;
};

export const requestGoogleCalendarAccessToken = async (interactive = true): Promise<string | null> => {
  const existingToken = getStoredGoogleCalendarToken();

  if (existingToken) {
    return existingToken;
  }

  if (!interactive) {
    return null;
  }

  await loadGoogleIdentityScript();

  const clientId = getGoogleClientId();
  const googleAccounts = window.google?.accounts;

  if (!clientId || !googleAccounts?.oauth2) {
    throw new Error("Google Calendar indisponible");
  }

  return new Promise<string>((resolve, reject) => {
    const tokenClient = googleAccounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || "Connexion Google Calendar refusee"));
          return;
        }

        setStoredGoogleCalendarToken(response.access_token, response.expires_in);
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

export const disconnectGoogleCalendar = async (): Promise<void> => {
  await loadGoogleIdentityScript();

  const accessToken = getStoredGoogleCalendarToken();
  const googleAccounts = window.google?.accounts;

  if (accessToken && googleAccounts?.oauth2) {
    googleAccounts.oauth2.revoke(accessToken, () => undefined);
  }

  clearGoogleCalendarSession();
};

export const fetchGoogleCalendarEvents = async (timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> => {
  const accessToken = getStoredGoogleCalendarToken();

  if (!accessToken) {
    return [];
  }

  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    maxResults: "2500",
  });

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    clearGoogleCalendarSession();
    throw new Error("La connexion Google Calendar a expire");
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Impossible de recuperer le Google Calendar");
  }

  return (payload.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary || "Evenement Google",
    start: item.start?.dateTime || item.start?.date,
    end: item.end?.dateTime || item.end?.date,
    isAllDay: !!item.start?.date && !item.start?.dateTime,
    location: item.location,
    htmlLink: item.htmlLink,
  }));
};
