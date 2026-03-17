import type { Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { createAccessToken, createRefreshToken, verifyToken } from "../utils/tokenUtils.js";
import { sendSuccess, sendUpdated } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

const buildAuthResponse = (
  user: {
    _id: { toString(): string };
    name: string;
    email: string;
    receiveEmail: boolean;
    isAdmin: boolean;
  },
  accessToken: string,
  refreshToken: string,
  message: string
) => ({
  success: true,
  message,
  data: {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      receiveEmail: user.receiveEmail,
      isAdmin: user.isAdmin,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  },
  token: accessToken,
  refreshToken,
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  receiveEmail: user.receiveEmail,
  isAdmin: user.isAdmin,
});

/************************************ Register User ************************************/
const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const nameExist = await User.findOne({ name });
  if (nameExist) {
    throw createError("Ce nom est deja utilise", 409);
  }

  const emailExist = await User.findOne({ email });
  if (emailExist) {
    throw createError("Cet email est deja utilise", 409);
  }

  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  const refreshToken = createRefreshToken("temp");

  const user = await User.create({
    name,
    email,
    password: hashed,
    receiveEmail: false,
    isAdmin: false,
    refreshToken,
  });

  const finalRefreshToken = createRefreshToken(user._id.toString());
  await User.findByIdAndUpdate(user._id, { refreshToken: finalRefreshToken });

  const accessToken = createAccessToken(user._id.toString());

  res.status(201).json(buildAuthResponse(user, accessToken, finalRefreshToken, "Compte cree avec succes"));
};

/************************************ Login User ************************************/
const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createError("Email ou mot de passe incorrect", 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw createError("Email ou mot de passe incorrect", 401);
  }

  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());

  await User.findByIdAndUpdate(user._id, { refreshToken });

  res.status(200).json(buildAuthResponse(user, accessToken, refreshToken, "Connexion reussie"));
};

/************************************ Login With Google ************************************/
const loginWithGoogle = async (req: AuthRequest, res: Response): Promise<void> => {
  const { credential } = req.body;

  if (!googleClient || !env.GOOGLE_CLIENT_ID) {
    throw createError("Connexion Google non configuree", 503);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw createError("Compte Google invalide", 401);
  }

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    const salt = await bcrypt.genSalt();
    const generatedPassword = await bcrypt.hash(`google:${payload.sub}:${env.SECRET}`, salt);

    user = await User.create({
      name: payload.name || payload.email,
      email: payload.email,
      password: generatedPassword,
      googleId: payload.sub,
      receiveEmail: false,
      isAdmin: false,
      refreshToken: null,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }

  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());

  await User.findByIdAndUpdate(user._id, { refreshToken, googleId: payload.sub });

  res.status(200).json(buildAuthResponse(user, accessToken, refreshToken, "Connexion Google reussie"));
};

/************************************ Update User ************************************/
const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, receiveEmail } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const userId = req.params.id || req.user._id.toString();

  if (userId !== req.user._id.toString()) {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      throw createError("Vous n'etes pas autorise a modifier ce compte", 403);
    }
  }

  const updateFields: { name?: string; email?: string; password?: string; receiveEmail?: boolean } = {};

  if (name) {
    updateFields.name = name;
  }
  if (email) {
    const emailExist = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExist) {
      throw createError("Cet email est deja utilise", 409);
    }
    updateFields.email = email;
  }
  if (password) {
    const salt = await bcrypt.genSalt();
    updateFields.password = await bcrypt.hash(password, salt);
  }
  if (receiveEmail !== undefined) {
    updateFields.receiveEmail = receiveEmail;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select(
    "-password -refreshToken"
  );

  if (!updatedUser) {
    throw createError("Utilisateur non trouve", 404);
  }

  sendUpdated(
    res,
    {
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        receiveEmail: updatedUser.receiveEmail,
        isAdmin: updatedUser.isAdmin,
      },
    },
    "Utilisateur mis a jour avec succes"
  );
};

/************************************ Refresh Token ************************************/
const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createError("Token de rafraichissement manquant", 401);
  }

  try {
    const decoded = verifyToken(token) as { _id: string; type: string };

    if (decoded.type !== "refresh") {
      throw createError("Type de token invalide", 401);
    }

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== token) {
      throw createError("Token de rafraichissement invalide", 401);
    }

    const newAccessToken = createAccessToken(user._id.toString());
    const newRefreshToken = createRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.status(200).json(buildAuthResponse(user, newAccessToken, newRefreshToken, "Tokens rafraichis avec succes"));
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw createError("Token de rafraichissement expire", 401);
    }
    throw createError("Token de rafraichissement invalide", 401);
  }
};

/************************************ Verify Token ************************************/
const verifyAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  sendSuccess(
    res,
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        receiveEmail: user.receiveEmail,
        isAdmin: user.isAdmin,
      },
    },
    "Token valide"
  );
};

/************************************ Logout ************************************/
const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  sendSuccess(res, undefined, "Deconnexion reussie");
};

export { registerUser, loginUser, loginWithGoogle, updateUser, refreshToken, verifyAuth, logout };
