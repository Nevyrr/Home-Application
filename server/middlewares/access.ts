import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.js";
import { createError } from "./errorHandler.js";
import { canUserWrite } from "../utils/userAccess.js";

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(createError("Utilisateur non authentifie", 401));
  }

  if (!req.user.isAdmin) {
    return next(createError("Acces reserve aux administrateurs", 403));
  }

  next();
};

export const requireWritable = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(createError("Utilisateur non authentifie", 401));
  }

  if (!canUserWrite(req.user)) {
    return next(createError("Ce compte est en lecture seule", 403));
  }

  next();
};
