import User from "../models/UserModel.js";
import { sendEmail } from "../config/nodeMailConfig.js";
import { logger } from "./logger.js";

/**
 * Une adresse de rappel non liee a un compte de l'appli ne peut pas etre verifiee :
 * on l'envoie par defaut plutot que de la bloquer silencieusement.
 */
const isRecipientOptedIn = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email });
  return !user || user.receiveEmail;
};

/**
 * Envoie un rappel aux adresses configurees (EMAIL_RECIPIENT_1/2), en respectant la case
 * "Notifications" du profil de l'utilisateur associe a chaque adresse quand elle existe.
 */
export const sendReminderEmails = (subject: string, message: string): void => {
  const { EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2 } = process.env;

  [EMAIL_RECIPIENT_1, EMAIL_RECIPIENT_2].forEach((recipient) => {
    if (!recipient) {
      return;
    }

    void isRecipientOptedIn(recipient)
      .then((optedIn) => (optedIn ? sendEmail(recipient, subject, message) : undefined))
      .catch((error) => {
        logger.error("Echec de l'envoi d'un email de rappel", { error, recipient });
      });
  });
};
