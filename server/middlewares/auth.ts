import type { Request, Response, NextFunction } from "express";
import User from "../models/UserModel.js";
import { IUser } from "../types/index.js";
import { createError } from "./errorHandler.js";
import { verifyToken } from "../utils/tokenUtils.js";

interface AuthRequest extends Request {
  user?: IUser | null;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Check if the request headers contains the authorization key
  const { authorization } = req.headers;
  if (!authorization) {
    throw createError("Token d'autorisation manquant", 401);
  }

  // Grab the token from headers (taking the "Bearer " string away)
  const token = authorization.split(" ")[1];
  if (!token) {
    throw createError("Format de token invalide", 401);
  }

  try {
    // Verify and decode the token
    const decoded = verifyToken(token);

    // Vérifier que c'est un token d'accès (ou un ancien token sans type)
    // Les anciens tokens n'ont pas le champ 'type', donc on les accepte pour compatibilité
    if (decoded.type && decoded.type !== 'access') {
      throw createError("Type de token invalide. Utilisez un token d'accès", 401);
    }

    // Save the user in request
    req.user = await User.findById(decoded._id).select("_id name email receiveEmail isAdmin");

    if (!req.user) {
      throw createError("Utilisateur non trouvé", 401);
    }

    // Go to the next function/middleware
    next();
  } catch (error: any) {
    // Si c'est déjà une AppError, la relancer
    if (error.statusCode) {
      throw error;
    }
    if (error.name === 'JsonWebTokenError') {
      throw createError("Token invalide", 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw createError("Token expiré. Veuillez vous reconnecter ou rafraîchir votre token", 401);
    }
    throw error;
  }
};

export default auth;
export type { AuthRequest };

