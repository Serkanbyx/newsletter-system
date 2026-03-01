const nodemailer = require("nodemailer");

let transporter;
let isDemoMode = false;

const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const createDemoTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  console.log("[Mailer] ========== DEMO MODE ==========");
  console.log("[Mailer] No SMTP credentials found — using Ethereal test account");
  console.log(`[Mailer] Test inbox: https://ethereal.email/login`);
  console.log(`[Mailer] User: ${testAccount.user}`);
  console.log(`[Mailer] Pass: ${testAccount.pass}`);
  console.log("[Mailer] ==================================");

  isDemoMode = true;

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const getTransporter = () => transporter;

const initTransporter = async () => {
  if (transporter) return transporter;

  if (hasSmtpConfig()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = await createDemoTransporter();
  }

  return transporter;
};

const verifyConnection = async () => {
  try {
    await initTransporter();
    await transporter.verify();
    const mode = isDemoMode ? "Ethereal (demo)" : "SMTP";
    console.log(`[Mailer] ${mode} connection verified successfully`);
    return true;
  } catch (error) {
    console.error("[Mailer] Connection failed:", error.message);
    return false;
  }
};

const getIsDemoMode = () => isDemoMode;

module.exports = { getTransporter, initTransporter, verifyConnection, getIsDemoMode };
