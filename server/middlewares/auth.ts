import type { Request, Response, NextFunction } from "express";
import User from "../models/UserModel.js";
import { IUser } from "../types/index.js";
import { createError } from "./errorHandler.js";
import { verifyToken } from "../utils/tokenUtils.js";

interface AuthRequest extends Request {
  user?: IUser | null;
}

const auth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the request headers contains the authorization key
    const { authorization } = req.headers;
    if (!authorization) {
      return next(createError("Token d'autorisation manquant", 401));
    }

    // Grab the token from headers (taking the "Bearer " string away)
    const token = authorization.split(" ")[1];
    if (!token) {
      return next(createError("Format de token invalide", 401));
    }

    // Verify and decode the token
    const decoded = verifyToken(token);

    // Vérifier que c'est un token d'accès (ou un ancien token sans type)
    // Les anciens tokens n'ont pas le champ 'type', donc on les accepte pour compatibilité
    if (decoded.type && decoded.type !== 'access') {
      return next(createError("Type de token invalide. Utilisez un token d'accès", 401));
    }

    // Save the user in request
    const user = await User.findById(decoded._id).select("_id name email receiveEmail isAdmin");
    if (user) {
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        password: '', // Not needed for auth request
        receiveEmail: user.receiveEmail,
        isAdmin: user.isAdmin,
      } as IUser;
    } else {
      req.user = null;
    }

    if (!req.user) {
      return next(createError("Utilisateur non trouvé", 401));
    }

    // Go to the next function/middleware
    next();
  } catch (error: any) {
    // Si c'est déjà une AppError, la transmettre
    if (error.statusCode) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(createError("Token invalide", 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError("Token expiré. Veuillez vous reconnecter ou rafraîchir votre token", 401));
    }
    return next(error);
  }
};

export default auth;
export type { AuthRequest };

