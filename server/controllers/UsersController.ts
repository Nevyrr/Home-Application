import type { Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserModel.js";
import CalendarEvent from "../models/CalendarEventModel.js";
import ReminderPost from "../models/ReminderPostModel.js";
import ShoppingDay from "../models/ShoppingPostModel.js";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { createAccessToken, createRefreshToken, verifyToken } from "../utils/tokenUtils.js";
import { sendDeleted, sendSuccess, sendUpdated } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { isEmailConfigured, sendEmail } from "../config/nodeMailConfig.js";
import { canUserWrite, isBootstrapAdminEmail, serializeUser, syncUserAccessState } from "../utils/userAccess.js";
import type { IUser, UserRole } from "../types/index.js";

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;
const RESET_PASSWORD_TTL_MS = 60 * 60 * 1000;

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const hashResetToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

const createPasswordResetToken = (): { rawToken: string; hashedToken: string; expiresAt: Date } => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  return {
    rawToken,
    hashedToken: hashResetToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_PASSWORD_TTL_MS),
  };
};

const buildResetPasswordUrl = (token: string): string => {
  const frontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
};

const buildAuthResponse = (
  user: IUser,
  accessToken: string,
  refreshToken: string,
  message: string
) => {
  const serializedUser = serializeUser(user);

  return {
    success: true,
    message,
    data: {
      user: serializedUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    },
    token: accessToken,
    refreshToken,
    ...serializedUser,
  };
};

const issueSession = async (
  user: IUser,
  message: string
): Promise<ReturnType<typeof buildAuthResponse>> => {
  await syncUserAccessState(user);

  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return buildAuthResponse(user, accessToken, refreshToken, message);
};

const getManagedUserOrFail = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  await syncUserAccessState(user);
  return user;
};

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

  const hashed = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashed,
    receiveEmail: false,
    isAdmin: false,
    accessLevel: "readonly",
    refreshToken: createRefreshToken("temp"),
  });

  const authResponse = await issueSession(user, "Compte cree avec succes");
  res.status(201).json(authResponse);
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

  const authResponse = await issueSession(user, "Connexion reussie");
  res.status(200).json(authResponse);
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
    const generatedPassword = await hashPassword(`google:${payload.sub}:${env.SECRET}`);

    user = await User.create({
      name: payload.name || payload.email,
      email: payload.email,
      password: generatedPassword,
      googleId: payload.sub,
      receiveEmail: false,
      isAdmin: false,
      accessLevel: "readonly",
      refreshToken: null,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    await user.save();
  }

  const authResponse = await issueSession(user, "Connexion Google reussie");
  res.status(200).json(authResponse);
};

/************************************ Update User ************************************/
const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, receiveEmail } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const userId = req.params.id || req.user._id.toString();
  const isSelfUpdate = userId === req.user._id.toString();

  if (!isSelfUpdate && !req.user.isAdmin) {
    throw createError("Vous n'etes pas autorise a modifier ce compte", 403);
  }

  if (isSelfUpdate && !canUserWrite(req.user)) {
    throw createError("Ce compte est en lecture seule", 403);
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
    updateFields.password = await hashPassword(password);
  }

  if (receiveEmail !== undefined) {
    updateFields.receiveEmail = receiveEmail;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

  if (!updatedUser) {
    throw createError("Utilisateur non trouve", 404);
  }

  await syncUserAccessState(updatedUser);

  sendUpdated(
    res,
    {
      user: serializeUser(updatedUser),
    },
    "Utilisateur mis a jour avec succes"
  );
};

/************************************ Forgot Password ************************************/
const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!isEmailConfigured()) {
    throw createError("La reinitialisation par email n'est pas configuree", 503);
  }

  const { email } = req.body as { email: string };
  const successMessage =
    "Si un compte existe pour cette adresse email, un lien de reinitialisation a ete envoye.";

  const user = await User.findOne({ email });

  if (!user) {
    sendSuccess(res, undefined, successMessage);
    return;
  }

  const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  const resetUrl = buildResetPasswordUrl(rawToken);
  const expiresAtLabel = expiresAt.toLocaleString("fr-FR");

  await sendEmail(
    user.email,
    "Reinitialisation du mot de passe",
    [
      `Bonjour ${user.name},`,
      "",
      "Une demande de reinitialisation de mot de passe a ete effectuee pour votre compte.",
      `Utilisez ce lien pour definir un nouveau mot de passe : ${resetUrl}`,
      "",
      `Ce lien expire le ${expiresAtLabel}.`,
      "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.",
    ].join("\n")
  );

  sendSuccess(res, undefined, successMessage);
};

/************************************ Reset Password ************************************/
const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token, password } = req.body as { token: string; password: string };
  const hashedToken = hashResetToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw createError("Le lien de reinitialisation est invalide ou expire", 400);
  }

  user.password = await hashPassword(password);
  user.refreshToken = null;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  sendSuccess(res, undefined, "Mot de passe reinitialise avec succes");
};

/************************************ List Users ************************************/
const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find({}).sort({ isAdmin: -1, createdAt: 1 });
  const normalizedUsers = await Promise.all(users.map((user) => syncUserAccessState(user)));

  sendSuccess(
    res,
    {
      users: normalizedUsers.map((user) => serializeUser(user)),
    },
    "Utilisateurs recuperes avec succes"
  );
};

/************************************ Update User Access ************************************/
const updateUserAccess = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.id;
  const { role } = req.body as { role: UserRole };

  const user = await getManagedUserOrFail(userId);

  if (isBootstrapAdminEmail(user.email) && role !== "admin") {
    throw createError("Ce compte administrateur par defaut ne peut pas etre degrade ici", 400);
  }

  if (role === "admin") {
    user.isAdmin = true;
    user.accessLevel = "writable";
  } else {
    user.isAdmin = false;
    user.accessLevel = role;
  }

  await user.save();

  sendUpdated(
    res,
    {
      user: serializeUser(user),
    },
    "Niveau d'acces mis a jour avec succes"
  );
};

/************************************ Delete User ************************************/
const deleteUserAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError("Utilisateur non authentifie", 401);
  }

  const userId = req.params.id;

  if (userId === req.user._id.toString()) {
    throw createError("Vous ne pouvez pas supprimer votre propre compte depuis cette interface", 400);
  }

  const user = await getManagedUserOrFail(userId);

  if (user.isAdmin) {
    throw createError("Un compte administrateur ne peut pas etre supprime ici", 400);
  }

  await Promise.all([
    CalendarEvent.deleteMany({ user: user._id }),
    ReminderPost.deleteMany({ user: user._id }),
    ShoppingDay.updateMany({}, { $pull: { shoppingList: { user: user._id } } }),
    User.findByIdAndDelete(user._id),
  ]);

  sendDeleted(res, "Compte supprime avec succes");
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

    const authResponse = await issueSession(user, "Tokens rafraichis avec succes");
    res.status(200).json(authResponse);
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

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createError("Utilisateur non trouve", 404);
  }

  await syncUserAccessState(user);

  sendSuccess(
    res,
    {
      user: serializeUser(user),
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

export {
  registerUser,
  loginUser,
  loginWithGoogle,
  updateUser,
  forgotPassword,
  resetPassword,
  listUsers,
  updateUserAccess,
  deleteUserAccount,
  refreshToken,
  verifyAuth,
  logout,
};
