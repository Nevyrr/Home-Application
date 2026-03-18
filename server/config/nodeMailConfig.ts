import nodemailer from "nodemailer";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

const isEmailConfigured = (): boolean => Boolean(env.EMAIL_USER && env.EMAIL_PASS);

const sendEmail = async (emailDest: string, subject: string, text: string): Promise<void> => {
    if (!isEmailConfigured()) {
      throw new Error("Configuration email manquante");
    }

    const mailOptions = {
      from: env.EMAIL_USER,
      to: emailDest,
      subject,
      text,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info("Email sent", { to: emailDest, response: info.response });
    } catch (error: unknown) {
      logger.error("Error sending email", { error, to: emailDest });
      throw error;
    }
  };

export { isEmailConfigured, sendEmail };

