import type { Express } from "express";

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

/**
 * Render place un reverse proxy devant le service web et définit RENDER=true.
 * Une seule étape est approuvée afin qu'Express utilise l'adresse transmise par
 * ce proxy sans rendre X-Forwarded-For fiable lors d'un accès direct/local.
 */
export const configureTrustProxy = (
  app: Express,
  runtimeEnvironment: RuntimeEnvironment = process.env,
): void => {
  if (runtimeEnvironment.RENDER === "true") {
    app.set("trust proxy", 1);
  }
};
