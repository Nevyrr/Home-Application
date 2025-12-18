/**
 * Middleware de gestion centralisée des erreurs
 */
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { sendError, sendValidationError } from '../utils/apiResponse.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Crée une erreur opérationnelle personnalisée
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  if (errors) {
    error.errors = errors;
  }
  return error;
};

/**
 * Gère les erreurs de validation Zod
 */
const handleZodError = (err: ZodError): { message: string; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  
  err.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  });

  return {
    message: 'Erreurs de validation',
    errors,
  };
};

/**
 * Gère les erreurs MongoDB
 */
const handleMongoError = (err: any): { message: string; statusCode: number } => {
  // Erreur de duplication (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return {
      message: `${field} est déjà utilisé`,
      statusCode: 409, // Conflict
    };
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = [err.errors[key].message];
    });
    return {
      message: 'Erreurs de validation',
      statusCode: 400,
    };
  }

  // Erreur de cast (ObjectId invalide)
  if (err.name === 'CastError') {
    return {
      message: 'ID invalide',
      statusCode: 400,
    };
  }

  return {
    message: 'Erreur de base de données',
    statusCode: 500,
  };
};

/**
 * Middleware de gestion des erreurs
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Une erreur interne est survenue';
  let errors: Record<string, string[]> | undefined;

  // Erreur personnalisée AppError
  if ((err as AppError).statusCode) {
    statusCode = (err as AppError).statusCode!;
    message = err.message;
    errors = (err as AppError).errors;
  }
  // Erreur de validation Zod
  else if (err instanceof ZodError) {
    const zodError = handleZodError(err);
    statusCode = 400;
    message = zodError.message;
    errors = zodError.errors;
  }
  // Erreur MongoDB
  else if (err instanceof mongoose.Error || err.name === 'MongoServerError') {
    const mongoError = handleMongoError(err);
    statusCode = mongoError.statusCode;
    message = mongoError.message;
  }
  // Erreur standard
  else {
    message = err.message || message;
  }

  // Log l'erreur
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      path: req.path,
      method: req.method,
    });
  }

  // En production, ne pas exposer les détails des erreurs internes
  const responseMessage =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue'
      : message;

  // Envoyer la réponse avec le format standardisé
  if (errors) {
    sendValidationError(res, errors, responseMessage);
  } else {
    sendError(res, responseMessage, statusCode);
  }
};

/**
 * Wrapper pour les fonctions async qui gère automatiquement les erreurs
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

