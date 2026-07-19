// Sur le web, l'app est servie par le meme serveur que l'API : les chemins relatifs
// ("/api/...") suffisent. Dans l'app native (Capacitor), l'app est chargee depuis
// https://localhost (WebView) et doit appeler l'URL complete du backend deploye,
// fournie via VITE_API_BASE_URL au moment du build mobile.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;
