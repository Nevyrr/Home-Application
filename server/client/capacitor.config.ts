import type { CapacitorConfig } from "@capacitor/cli";

// En dev, lance `CAP_SERVER_URL=http://<ton-ip-locale>:5173 npx cap run android` (ou ios)
// pour que l'app native recharge en direct depuis le serveur Vite au lieu du build embarque.
const liveReloadUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.davinhub.app",
  appName: "DavinHub",
  webDir: "dist",
  // WKWebView reserve http/https : iOS utilise le schema local de Capacitor.
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    ...(liveReloadUrl ? { url: liveReloadUrl, cleartext: true } : {}),
  },
};

export default config;
