const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const verifyConnection = async () => {
  try {
    await getTransporter().verify();
    console.log("[Mailer] SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("[Mailer] SMTP connection failed:", error.message);
    return false;
  }
};

module.exports = { getTransporter, verifyConnection };
