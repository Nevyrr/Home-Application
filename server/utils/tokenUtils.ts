/**
 * Utilitaires pour la gestion des tokens JWT
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  _id: string;
  type?: 'access' | 'refresh'; // Optionnel pour compatibilité avec les anciens tokens
}

/**
 * Crée un token d'accès (court terme)
 */
export const createAccessToken = (_id: string): string => {
  const payload: TokenPayload = { _id, type: 'access' };
  return jwt.sign(payload, env.SECRET, { expiresIn: '15m' }); // 15 minutes
};

/**
 * Crée un token de rafraîchissement (long terme)
 */
export const createRefreshToken = (_id: string): string => {
  const payload: TokenPayload = { _id, type: 'refresh' };
  return jwt.sign(payload, env.SECRET, { expiresIn: '7d' }); // 7 jours
};

/**
 * Vérifie et décode un token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.SECRET) as TokenPayload;
  } catch (error) {
    throw error;
  }
};

/**
 * Décode un token sans vérification (pour récupérer les infos même si expiré)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

