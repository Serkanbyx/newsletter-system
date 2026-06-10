const nodemailer = require("nodemailer");
const { getTransporter, getIsDemoMode } = require("../config/mailer");
const Subscriber = require("../models/subscriber");
const Newsletter = require("../models/newsletter");

const getBaseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const buildUnsubscribeUrl = (token) =>
  `${getBaseUrl()}/api/subscribers/unsubscribe/${token}`;

const sendToSubscriber = async (newsletter, subscriber) => {
  const transporter = getTransporter();
  const unsubscribeUrl = buildUnsubscribeUrl(subscriber.token);

  const htmlContent = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
      <h1 style="color:#333;">${newsletter.subject}</h1>
      <div style="color:#555;line-height:1.6;">${newsletter.content}</div>
      <hr style="margin-top:32px;border:none;border-top:1px solid #eee;" />
      <p style="font-size:12px;color:#999;text-align:center;">
        You are receiving this because you subscribed to our newsletter.<br/>
        <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a>
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Newsletter"}" <${process.env.MAIL_FROM_ADDRESS || "demo@newsletter.test"}>`,
    to: subscriber.email,
    subject: newsletter.subject,
    html: htmlContent,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
    },
  });

  if (getIsDemoMode()) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Demo] Email preview for ${subscriber.email}: ${previewUrl}`);
  }
};

// Number of emails dispatched in parallel per batch. Keeps throughput high
// without overwhelming the SMTP provider's connection/rate limits.
const SEND_CONCURRENCY = 5;

const deliverToSubscriber = async (newsletter, subscriber) => {
  try {
    await sendToSubscriber(newsletter, subscriber);
    Newsletter.addLog({
      newsletterId: newsletter.id,
      subscriberId: subscriber.id,
      status: "sent",
    });
    return true;
  } catch (error) {
    Newsletter.addLog({
      newsletterId: newsletter.id,
      subscriberId: subscriber.id,
      status: "failed",
      errorMessage: error.message,
    });
    return false;
  }
};

const sendNewsletter = async (newsletterId) => {
  const newsletter = Newsletter.findById(newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");
  if (newsletter.status === "sent") throw new Error("Newsletter already sent");

  Newsletter.markAsSending(newsletterId);
  const subscribers = Subscriber.findAll(true);

  if (subscribers.length === 0) {
    Newsletter.markAsFailed(newsletterId);
    throw new Error("No active subscribers found");
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < subscribers.length; i += SEND_CONCURRENCY) {
    const batch = subscribers.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.all(
      batch.map((subscriber) => deliverToSubscriber(newsletter, subscriber))
    );
    for (const delivered of results) {
      delivered ? successCount++ : failCount++;
    }
  }

  if (successCount > 0) {
    Newsletter.markAsSent(newsletterId);
  } else {
    Newsletter.markAsFailed(newsletterId);
  }

  return { successCount, failCount, total: subscribers.length };
};

module.exports = { sendNewsletter };
