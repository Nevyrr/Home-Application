import type { CapacitorConfig } from "@capacitor/cli";

// En dev, lance `CAP_SERVER_URL=http://<ton-ip-locale>:5173 npx cap run android` (ou ios)
// pour que l'app native recharge en direct depuis le serveur Vite au lieu du build embarque.
const liveReloadUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.davinhub.app",
  appName: "DavinHub",
  webDir: "dist",
  // https par defaut sur les deux plateformes : evite les soucis de contenu mixte
  // (cookies/storage) puisque le backend est appele en https en production.
  server: {
    androidScheme: "https",
    iosScheme: "https",
    ...(liveReloadUrl ? { url: liveReloadUrl, cleartext: true } : {}),
  },
};

export default config;
