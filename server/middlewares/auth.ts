import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { IUser } from "../types/index.js";

interface AuthRequest extends Request {
  user?: IUser | null;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Check if the request headers contains the authorization key
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ error: "Authorization token not found" });
    return;
  }

  // Grab the token from headers (taking the "Bearer " string away)
  const token = authorization.split(" ")[1];

  try {
    // Decode and extract the user id from token
    const decoded = jwt.verify(token, process.env.SECRET as string) as { _id: string };
    // Save the user in request
    req.user = await User.findById(decoded._id).select("_id");

    // Go to the next function/middleware
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    res.status(401).json({ error: errorMessage });
  }
};

export default auth;
export type { AuthRequest };

