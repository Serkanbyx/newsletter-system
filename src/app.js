const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");
const { errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const subscriberRoutes = require("./routes/subscriberRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const { version } = require("../package.json");

const app = express();

app.use(express.json());
app.use("/api", apiLimiter);

// Welcome page
app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter System</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: #0b1120;
      color: #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 600px 400px at 20% 30%, rgba(59,130,246,0.12) 0%, transparent 70%),
        radial-gradient(ellipse 500px 350px at 80% 70%, rgba(168,85,247,0.10) 0%, transparent 70%),
        radial-gradient(ellipse 300px 300px at 50% 50%, rgba(236,72,153,0.06) 0%, transparent 70%);
      z-index: 0;
    }

    body::after {
      content: "";
      position: fixed;
      inset: 0;
      background:
        repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(148,163,184,0.03) 60px, rgba(148,163,184,0.03) 61px),
        repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(148,163,184,0.03) 60px, rgba(148,163,184,0.03) 61px);
      z-index: 0;
    }

    .envelope {
      position: fixed;
      opacity: 0.04;
      z-index: 0;
    }

    .envelope::before {
      content: "";
      display: block;
      border-style: solid;
    }

    .envelope-1 { top: 10%; left: 5%; }
    .envelope-1::before {
      width: 80px; height: 55px;
      border: 2px solid #3b82f6;
      border-radius: 4px;
    }
    .envelope-1::after {
      content: "";
      position: absolute;
      top: 0; left: 0;
      border-left: 40px solid transparent;
      border-right: 40px solid transparent;
      border-top: 30px solid rgba(59,130,246,0.3);
    }

    .envelope-2 { bottom: 15%; right: 8%; transform: rotate(12deg); }
    .envelope-2::before {
      width: 100px; height: 70px;
      border: 2px solid #a855f7;
      border-radius: 4px;
    }
    .envelope-2::after {
      content: "";
      position: absolute;
      top: 0; left: 0;
      border-left: 50px solid transparent;
      border-right: 50px solid transparent;
      border-top: 38px solid rgba(168,85,247,0.3);
    }

    .envelope-3 { top: 60%; left: 12%; transform: rotate(-8deg); }
    .envelope-3::before {
      width: 60px; height: 42px;
      border: 2px solid #ec4899;
      border-radius: 3px;
    }
    .envelope-3::after {
      content: "";
      position: absolute;
      top: 0; left: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-top: 22px solid rgba(236,72,153,0.3);
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2.5rem;
      max-width: 520px;
      width: 90%;
      background: linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 20px;
      box-shadow:
        0 0 60px rgba(59,130,246,0.08),
        0 25px 50px rgba(0,0,0,0.4),
        inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .icon {
      width: 64px;
      height: 44px;
      margin: 0 auto 1.5rem;
      position: relative;
      border: 2.5px solid #3b82f6;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15));
    }

    .icon::before {
      content: "";
      position: absolute;
      top: -1px;
      left: -1px;
      border-left: 32px solid transparent;
      border-right: 32px solid transparent;
      border-top: 22px solid #3b82f6;
      filter: brightness(1.2);
    }

    .icon::after {
      content: "";
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background: #60a5fa;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(96,165,250,0.6);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
      50% { opacity: 1; transform: translateX(-50%) scale(1.4); }
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .version {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
      font-family: "Cascadia Code", "Fira Code", monospace;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px rgba(59,130,246,0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59,130,246,0.45);
      filter: brightness(1.1);
    }

    .btn-secondary {
      background: rgba(148,163,184,0.08);
      color: #94a3b8;
      border: 1px solid rgba(148,163,184,0.15);
    }

    .btn-secondary:hover {
      background: rgba(148,163,184,0.15);
      color: #e2e8f0;
      border-color: rgba(148,163,184,0.3);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.8rem;
      color: #475569;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(148,163,184,0.08);
    }

    .sign a {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.2s;
    }

    .sign a:hover {
      color: #a78bfa;
    }

    @media (max-width: 480px) {
      .container { padding: 2rem 1.5rem; }
      h1 { font-size: 1.6rem; }
    }
  </style>
</head>
<body>
  <div class="envelope envelope-1"></div>
  <div class="envelope envelope-2"></div>
  <div class="envelope envelope-3"></div>
  <div class="container">
    <div class="icon"></div>
    <h1>Newsletter System</h1>
    <p class="version">v${version}</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/health" class="btn-secondary">System Health</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/newsletters", newsletterRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Detailed health check
 *     tags: [System]
 *     description: Returns system health with database, SMTP, uptime, memory, and statistics
 *     responses:
 *       200:
 *         description: System health report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded]
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: string
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     smtp:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         mode:
 *                           type: string
 *                           enum: [demo, production]
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeSubscribers:
 *                       type: integer
 *                     newsletters:
 *                       type: object
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: string
 *                     heapUsed:
 *                       type: string
 */
app.get("/health", async (_req, res) => {
  const Subscriber = require("./models/subscriber");
  const Newsletter = require("./models/newsletter");
  const { getTransporter, getIsDemoMode } = require("./config/mailer");

  let dbStatus = "ok";
  let subscriberCount = 0;
  let newsletterStats = {};
  try {
    subscriberCount = Subscriber.countActive();
    newsletterStats = Newsletter.countByStatus();
  } catch {
    dbStatus = "error";
  }

  let smtpStatus = "ok";
  try {
    const transporter = getTransporter();
    if (transporter) await transporter.verify();
    else smtpStatus = "not_initialized";
  } catch {
    smtpStatus = "error";
  }

  const overallStatus = dbStatus === "ok" && smtpStatus !== "error" ? "healthy" : "degraded";

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    version,
    services: {
      database: dbStatus,
      smtp: { status: smtpStatus, mode: getIsDemoMode() ? "demo" : "production" },
    },
    stats: {
      activeSubscribers: subscriberCount,
      newsletters: newsletterStats,
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
