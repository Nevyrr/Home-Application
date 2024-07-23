import jwt from "jsonwebtoken";
import User, { IUser } from "../models/UserModel.js";
import { NextFunction, Request, Response } from "express";


declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  // Check if the request headers contains the authorization key
  const authorization: string | undefined = req.headers['authorization'];
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token not found" });
  }

  // Grab the token from headers (taking the "Bearer " string away)
  const token = authorization.split(" ")[1];

  try {
    // Decode and extract the user id from token
    if (process.env.SECRET === undefined) {
      res.status(401).json({ error: "no SECRET env defined" });
      return;
    }

    const _id = jwt.verify(token, process.env.SECRET);
  
    // Save the user in request
    const document = await User.findById(_id).select("_id");
    req.user = document?.toObject() as IUser;

    // Go to the next function/middleware
    next();
  } catch (err) {
    res.status(401).json({ error: err });
  }
};

export default auth