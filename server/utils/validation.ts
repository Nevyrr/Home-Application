/**
 * Schemas de validation avec Zod
 */
import { z } from "zod";

/**
 * Validation de l'email
 */
export const emailSchema = z.string().email("Email invalide");

/**
 * Validation du mot de passe
 * Minimum 8 caracteres, au moins une majuscule, une minuscule et un chiffre
 */
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

/**
 * Schema de validation pour l'inscription
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres").max(50),
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema de validation pour la connexion
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  password: passwordSchema,
});

/**
 * Schema de validation pour la mise a jour d'utilisateur
 */
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  receiveEmail: z.boolean().optional(),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(["admin", "writable", "readonly"]),
});

/**
 * Schema de validation pour les evenements calendrier
 */
export const calendarEventSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  date: z.string().min(1, "La date est requise"),
  duration: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, "Couleur de priorite invalide"),
});

/**
 * Schema de validation pour les rappels
 */
export const reminderPostSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  body: z.string().optional().default(""),
  priorityColor: z.number().int().min(0).max(3, "Couleur de priorite invalide").default(0),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
  dueDate: z.union([z.string(), z.literal("")]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reminderReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1, "L'identifiant est requis")).min(1, "Au moins une tache est requise"),
});

/**
 * Schema de validation pour les posts de shopping (creation)
 */
export const shoppingPostSchema = z.object({
  shoppingListId: z.string().min(1, "L'ID de la liste est requis"),
  title: z.string().min(1, "Le titre est requis"),
  count: z.number().positive("La quantite doit etre positive"),
  unit: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, "Couleur de priorite invalide"),
});

/**
 * Schema de validation pour la mise a jour des posts de shopping (sans shoppingListId)
 */
export const shoppingPostUpdateSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  count: z.number().positive("La quantite doit etre positive"),
  unit: z.string().optional(),
  priorityColor: z.number().int().min(0).max(3, "Couleur de priorite invalide"),
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
      next(error);
    }
  };
};
