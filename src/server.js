require("dotenv").config();

const app = require("./app");
const { getDatabase } = require("./config/database");
const { verifyConnection, getIsDemoMode } = require("./config/mailer");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  getDatabase();
  console.log("[Database] SQLite initialized");

  await verifyConnection();

  startScheduler();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Swagger] API docs at ${process.env.BASE_URL || "http://localhost:" + PORT}/api-docs`);
    if (getIsDemoMode()) {
      console.log("[Server] Running in DEMO mode — emails are captured by Ethereal, not actually delivered");
    }
  });
};

bootstrap().catch((err) => {
  console.error("[Fatal] Failed to start server:", err);
  process.exit(1);
});
