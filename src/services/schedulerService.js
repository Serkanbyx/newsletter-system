const cron = require("node-cron");
const Newsletter = require("../models/newsletter");
const { sendNewsletter } = require("./emailService");

let task;

const startScheduler = () => {
  // Runs every minute to check for scheduled newsletters
  task = cron.schedule("* * * * *", async () => {
    const readyNewsletters = Newsletter.findScheduledReady();

    if (readyNewsletters.length === 0) return;

    console.log(
      `[Scheduler] Found ${readyNewsletters.length} newsletter(s) ready to send`
    );

    for (const newsletter of readyNewsletters) {
      try {
        console.log(
          `[Scheduler] Sending newsletter #${newsletter.id}: "${newsletter.subject}"`
        );
        const result = await sendNewsletter(newsletter.id);
        console.log(
          `[Scheduler] Newsletter #${newsletter.id} sent — ${result.successCount}/${result.total} delivered`
        );
      } catch (error) {
        console.error(
          `[Scheduler] Failed to send newsletter #${newsletter.id}:`,
          error.message
        );
      }
    }
  });

  console.log("[Scheduler] Cron job started — checking every minute");
};

const stopScheduler = () => {
  if (task) {
    task.stop();
    console.log("[Scheduler] Cron job stopped");
  }
};

module.exports = { startScheduler, stopScheduler };
