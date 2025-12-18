/**
 * Schémas de validation avec Zod
 */
import { z } from 'zod';

/**
 * Validation de l'email
 */
export const emailSchema = z.string().email('Email invalide');

/**
 * Validation du mot de passe
 * Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
});

/**
 * Schéma de validation pour la mise à jour d'utilisateur
 */
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  receiveEmail: z.boolean().optional(),
});

/**
 * Schéma de validation pour les événements calendrier
 */
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  date: z.string().min(1, 'La date est requise'),
  duration: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, 'Couleur de priorité invalide'),
});

/**
 * Schéma de validation pour les rappels
 */
export const reminderPostSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  body: z.string().min(1, 'Le contenu est requis'),
  priorityColor: z.number().int().min(0).max(3, 'Couleur de priorité invalide'),
});

/**
 * Schéma de validation pour les posts de shopping (création)
 */
export const shoppingPostSchema = z.object({
  shoppingListId: z.string().min(1, 'L\'ID de la liste est requis'),
  title: z.string().min(1, 'Le titre est requis'),
  count: z.number().positive('La quantité doit être positive'),
  unit: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, 'Couleur de priorité invalide'),
});

/**
 * Schéma de validation pour la mise à jour des posts de shopping (sans shoppingListId)
 */
export const shoppingPostUpdateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  count: z.number().positive('La quantité doit être positive'),
  unit: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, 'Couleur de priorité invalide'),
});

/**
 * Middleware de validation avec Zod
 */
export const validate = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: any, _res: any, next: any): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // Laisser le errorHandler gérer l'erreur Zod
      next(error);
    }
  };
};

