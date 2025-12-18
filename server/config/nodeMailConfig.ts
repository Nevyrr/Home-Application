import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = (emailDest: string, subject: string, text: string): void => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailDest,
      subject,
      text,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info?.response);
      }
    });
  };

export { sendEmail };

