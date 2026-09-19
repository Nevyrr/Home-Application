import { sendEmail } from "../config/nodeMailConfig.js";
import User from "../models/UserModel.js";
import { logger } from "./logger.js";

export interface ReminderEmailResult {
  recipients: string[];
  sent: number;
  failed: number;
}

/**
 * Les destinataires viennent uniquement des comptes ayant active les notifications.
 * Aucune adresse de rappel n'est definie dans le code ou la configuration du serveur.
 */
export const getReminderRecipients = async (): Promise<string[]> => {
  const optedInUsers = await User.find({ receiveEmail: true }).select("email").lean();
  return [...new Set(optedInUsers.map((user) => user.email.trim().toLowerCase()).filter(Boolean))];
};

/**
 * Attend la reponse SMTP afin que l'appelant ne considere pas le rappel comme envoye
 * avant que le fournisseur de messagerie ne l'ait accepte.
 */
export const sendReminderEmails = async (subject: string, message: string): Promise<ReminderEmailResult> => {
  const recipients = await getReminderRecipients();
  if (recipients.length === 0) {
    return { recipients: [], sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    recipients.map((recipient) => sendEmail(recipient, subject, message))
  );
  const failures = results.flatMap((result, index) =>
    result.status === "rejected" ? [{ recipient: recipients[index], error: result.reason }] : []
  );

  failures.forEach(({ recipient, error }) => {
    logger.error("Échec de l'envoi d'un email de rappel", { error, recipient });
  });

  if (failures.length === recipients.length) {
    throw new AggregateError(failures.map(({ error }) => error), "Tous les emails de rappel ont échoué");
  }

  return { recipients, sent: recipients.length - failures.length, failed: failures.length };
};
