/**
 * Format de réponse API standardisé
 */
import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    path?: string;
  };
}

/**
 * Envoie une réponse de succès standardisée
 * Compatible avec l'ancien format frontend en ajoutant les données à la racine
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req?.path,
    },
  };

  // Compatibilité avec l'ancien format frontend : ajouter les données à la racine
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // Copier toutes les propriétés de data dans response (sauf celles déjà présentes)
    for (const key in data) {
      if (data.hasOwnProperty(key) && key !== 'meta') {
        (response as any)[key] = (data as any)[key];
      }
    }
  }

  res.status(statusCode).json(response);
};

/**
 * Envoie une réponse d'erreur standardisée
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void => {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req?.path,
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Envoie une réponse de création réussie
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || 'Ressource créée avec succès',
    data,
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req.path,
    },
  };

  // Compatibilité avec l'ancien format frontend
  if (data && typeof data === 'object') {
    Object.assign(response, data);
    // Ajouter aussi success pour compatibilité
    (response as any).success = message || 'Ressource créée avec succès';
  }

  res.status(201).json(response);
};

/**
 * Envoie une réponse de mise à jour réussie
 */
export const sendUpdated = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || 'Ressource mise à jour avec succès',
    data,
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req.path,
    },
  };

  // Compatibilité avec l'ancien format frontend
  if (data && typeof data === 'object') {
    Object.assign(response, data);
    // Ajouter aussi success pour compatibilité
    (response as any).success = message || 'Ressource mise à jour avec succès';
  }

  res.status(200).json(response);
};

/**
 * Envoie une réponse de suppression réussie
 */
export const sendDeleted = (
  res: Response,
  message?: string
): void => {
  const response: ApiResponse = {
    success: true,
    message: message || 'Ressource supprimée avec succès',
    meta: {
      timestamp: new Date().toISOString(),
      path: res.req.path,
    },
  };

  // Compatibilité avec l'ancien format frontend
  (response as any).success = message || 'Ressource supprimée avec succès';

  res.status(200).json(response);
};

/**
 * Envoie une réponse de validation échouée
 */
export const sendValidationError = (
  res: Response,
  errors: Record<string, string[]>,
  message: string = 'Erreurs de validation'
): void => {
  sendError(res, message, 400, errors);
};

/**
 * Envoie une réponse d'authentification échouée
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Non autorisé'
): void => {
  sendError(res, message, 401);
};

/**
 * Envoie une réponse d'accès refusé
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Accès refusé'
): void => {
  sendError(res, message, 403);
};

/**
 * Envoie une réponse de ressource non trouvée
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Ressource non trouvée'
): void => {
  sendError(res, message, 404);
};

