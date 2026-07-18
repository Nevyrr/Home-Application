const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise: Promise<void> | null = null;

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
