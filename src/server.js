require("dotenv").config();

const app = require("./app");
const { getDatabase } = require("./config/database");
const { verifyConnection } = require("./config/mailer");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  // Initialize database
  getDatabase();
  console.log("[Database] SQLite initialized");

  // Verify SMTP connection
  await verifyConnection();

  // Start cron scheduler
  startScheduler();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Swagger] API docs at ${process.env.BASE_URL || "http://localhost:" + PORT}/api-docs`);
  });
};

bootstrap().catch((err) => {
  console.error("[Fatal] Failed to start server:", err);
  process.exit(1);
});
