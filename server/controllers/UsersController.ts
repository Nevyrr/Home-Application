import type { Response } from "express";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middlewares/auth.js";
import { createError } from "../middlewares/errorHandler.js";
import { createAccessToken, createRefreshToken, verifyToken } from "../utils/tokenUtils.js";
import { sendSuccess, sendUpdated } from "../utils/apiResponse.js";

/************************************ Register User ************************************/
const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab data from request body (validation déjà faite par le middleware)
  const { name, email, password } = req.body;

  // Check if name already exists
  const nameExist = await User.findOne({ name });
  if (nameExist) {
    throw createError("Ce nom est déjà utilisé", 409); // Conflict
  }

  // Check if email already exists
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    throw createError("Cet email est déjà utilisé", 409); // Conflict
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  // Create tokens
  const refreshToken = createRefreshToken("temp"); // Will be updated after user creation

  // Register the user
  const user = await User.create({ 
    name, 
    email, 
    password: hashed, 
    receiveEmail: false, 
    isAdmin: false,
    refreshToken
  });

  // Update refresh token with actual user ID
  const finalRefreshToken = createRefreshToken(user._id.toString());
  await User.findByIdAndUpdate(user._id, { refreshToken: finalRefreshToken });

  const accessToken = createAccessToken(user._id.toString());

  // Format compatible avec l'ancien frontend
  const response: any = {
    success: true,
    message: "Compte créé avec succès",
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
        refreshToken: finalRefreshToken,
      },
    },
    // Compatibilité avec l'ancien format
    token: accessToken, // Pour compatibilité avec l'ancien frontend
    name: user.name,
    email: user.email,
  };

  res.status(201).json(response);
};

/************************************ Login User ************************************/
const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab data from request body (validation déjà faite par le middleware)
  const { email, password } = req.body;

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    throw createError("Email ou mot de passe incorrect", 401);
  }

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw createError("Email ou mot de passe incorrect", 401);
  }

  // Create tokens
  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());

  // Save refresh token to database
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Format compatible avec l'ancien frontend
  const response: any = {
    success: true,
    message: "Connexion réussie",
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
    // Compatibilité avec l'ancien format
    token: accessToken, // Pour compatibilité avec l'ancien frontend
    name: user.name,
    email: user.email,
    receiveEmail: user.receiveEmail,
    isAdmin: user.isAdmin,
  };

  res.status(200).json(response);
};

/************************************ Update User ************************************/
const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  // Grab data from request body (validation déjà faite par le middleware)
  const { name, email, password, receiveEmail } = req.body;

  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  const userId = req.params.id || req.user._id.toString();

  // Vérifier que l'utilisateur modifie son propre compte ou est admin
  if (userId !== req.user._id.toString()) {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) {
      throw createError("Vous n'êtes pas autorisé à modifier ce compte", 403);
    }
  }

  const updateFields: { name?: string; email?: string; password?: string; receiveEmail?: boolean } = {};

  if (name) {
    updateFields.name = name;
  }
  if (email) {
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const emailExist = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExist) {
      throw createError("Cet email est déjà utilisé", 409);
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

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken');

  if (!updatedUser) {
    throw createError("Utilisateur non trouvé", 404);
  }

  sendUpdated(res, {
    user: {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      receiveEmail: updatedUser.receiveEmail,
      isAdmin: updatedUser.isAdmin,
    },
  }, "Utilisateur mis à jour avec succès");
};

/************************************ Refresh Token ************************************/
const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createError("Token de rafraîchissement manquant", 401);
  }

  try {
    const decoded = verifyToken(token) as { _id: string; type: string };

    if (decoded.type !== 'refresh') {
      throw createError("Type de token invalide", 401);
    }

    // Vérifier que le token est toujours valide dans la base de données
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== token) {
      throw createError("Token de rafraîchissement invalide", 401);
    }

    // Créer de nouveaux tokens
    const newAccessToken = createAccessToken(user._id.toString());
    const newRefreshToken = createRefreshToken(user._id.toString());

    // Mettre à jour le refresh token dans la base de données
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    sendSuccess(res, {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    }, "Tokens rafraîchis avec succès");
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw createError("Token de rafraîchissement expiré", 401);
    }
    throw createError("Token de rafraîchissement invalide", 401);
  }
};

/************************************ Verify Token ************************************/
const verifyAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  const user = await User.findById(req.user._id).select('-password -refreshToken');
  if (!user) {
    throw createError("Utilisateur non trouvé", 404);
  }

  sendSuccess(res, {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      receiveEmail: user.receiveEmail,
      isAdmin: user.isAdmin,
    },
  }, "Token valide");
};

/************************************ Logout ************************************/
const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError("Utilisateur non authentifié", 401);
  }

  // Supprimer le refresh token de la base de données
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  sendSuccess(res, undefined, "Déconnexion réussie");
};

export { registerUser, loginUser, updateUser, refreshToken, verifyAuth, logout };

