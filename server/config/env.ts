/**
 * Validation et chargement des variables d'environnement
 */

interface EnvConfig {
  DB_URI: string;
  SECRET: string;
  PORT: string;
  NODE_ENV: string;
  FRONTEND_URL: string;
  ACCESS_TOKEN_TTL: string;
  REFRESH_TOKEN_TTL: string;
  GOOGLE_CLIENT_ID?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_RECIPIENT_1?: string;
  EMAIL_RECIPIENT_2?: string;
  DEFAULT_ADMIN_EMAILS?: string;
}

const requiredEnvVars = ['DB_URI', 'SECRET'] as const;

/**
 * Valide que toutes les variables d'environnement requises sont présentes
 */
export const validateEnv = (): EnvConfig => {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}\n` +
      'Veuillez créer un fichier .env dans le dossier server avec ces variables.'
    );
  }

  // Validation de la longueur minimale du SECRET
  if (process.env.SECRET && process.env.SECRET.length < 32) {
    console.warn(
      '⚠️  ATTENTION: SECRET est trop court (minimum 32 caractères recommandé). ' +
      'Utilisez: openssl rand -base64 32 pour générer une clé sécurisée.'
    );
  }

  return {
    DB_URI: process.env.DB_URI!,
    SECRET: process.env.SECRET!,
    PORT: process.env.PORT || '4000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '30d',
    REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '60d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_RECIPIENT_1: process.env.EMAIL_RECIPIENT_1,
    EMAIL_RECIPIENT_2: process.env.EMAIL_RECIPIENT_2,
    DEFAULT_ADMIN_EMAILS: process.env.DEFAULT_ADMIN_EMAILS,
  };
};

export const env = validateEnv();

