const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");
const { errorHandler } = require("./middleware/errorHandler");
const subscriberRoutes = require("./routes/subscriberRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();

app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/newsletters", newsletterRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
