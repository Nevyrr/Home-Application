/**
 * Validation et chargement des variables d'environnement
 */

interface EnvConfig {
  DB_URI: string;
  SECRET: string;
  PORT: string;
  NODE_ENV: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_RECIPIENT_1?: string;
  EMAIL_RECIPIENT_2?: string;
}

const requiredEnvVars = ['DB_URI', 'SECRET'] as const;
const optionalEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_RECIPIENT_1', 'EMAIL_RECIPIENT_2'] as const;

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
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_RECIPIENT_1: process.env.EMAIL_RECIPIENT_1,
    EMAIL_RECIPIENT_2: process.env.EMAIL_RECIPIENT_2,
  };
};

export const env = validateEnv();

