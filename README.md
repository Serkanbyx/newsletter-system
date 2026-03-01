# 📬 Newsletter System

A robust email automation backend built with Node.js and Express. Manage subscribers, create newsletters, send them instantly or schedule for later — all powered by SQLite, Nodemailer, and Cron Jobs with full Swagger API documentation.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Subscribe / Unsubscribe** — Manage newsletter subscribers with email validation and unique unsubscribe tokens
- **Newsletter CRUD** — Create, update, and delete draft newsletters with subject and HTML content
- **Send Immediately** — Send a newsletter to all active subscribers with a single API call
- **Schedule Sending** — Schedule newsletters for a future date/time; a cron job checks every minute and sends automatically
- **Send Logs** — Track delivery status per subscriber per newsletter with detailed error logging
- **Swagger UI** — Interactive API documentation to explore and test all endpoints
- **Demo Mode** — When SMTP credentials are not configured, automatically falls back to Ethereal for testing
- **RESTful API** — Clean, well-structured REST endpoints following best practices

## Live Demo

[🚀 View Live Demo](https://newsletter-system-6hvv.onrender.com/)

> API Documentation is available at `/api-docs` endpoint on the live demo.

## Technologies

- **Node.js** — JavaScript runtime for server-side execution
- **Express 5** — Fast, minimalist HTTP server and routing framework
- **better-sqlite3** — Synchronous SQLite database driver for high-performance data operations
- **Nodemailer** — Reliable email sending with SMTP support and Ethereal fallback
- **node-cron** — Scheduled task execution for automated newsletter delivery
- **express-validator** — Request validation middleware for input sanitization
- **swagger-jsdoc + swagger-ui-express** — Auto-generated interactive API documentation
- **uuid** — Unique token generation for secure unsubscribe links
- **dotenv** — Environment variable management from `.env` files
- **nodemon** — Development auto-restart on file changes

## Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Gmail App Password** (optional, for real email sending)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Serkanbyx/Newsletter-System.git
cd Newsletter-System
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Edit `.env` with your SMTP credentials:

```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM_NAME=Newsletter System
MAIL_FROM_ADDRESS=your-email@gmail.com
BASE_URL=http://localhost:3000
```

> **Tip:** For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password. If you leave SMTP fields empty, the app runs in **demo mode** using Ethereal.

5. Start the server:

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

6. Open Swagger UI at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Usage

1. **Start the server** using `npm run dev` or `npm start`
2. **Open Swagger UI** at `/api-docs` to explore all available endpoints
3. **Add subscribers** via `POST /api/subscribers/subscribe` with email and name
4. **Create a newsletter** via `POST /api/newsletters` with subject and HTML content
5. **Send immediately** via `POST /api/newsletters/:id/send` to deliver to all active subscribers
6. **Or schedule** via `POST /api/newsletters/:id/schedule` with a future `scheduledAt` date
7. **Track delivery** via `GET /api/newsletters/:id/logs` to view per-subscriber send status

## How It Works?

### Newsletter Lifecycle

Each newsletter goes through the following states:

```
draft → scheduled → sending → sent
                            → failed (on error)
```

- **draft** — Newsletter is created but not yet sent
- **scheduled** — Newsletter is queued for a future send time
- **sending** — Newsletter is currently being delivered
- **sent** — All emails have been dispatched successfully
- **failed** — An error occurred during sending

### Scheduled Sending

The scheduler service runs a cron job every minute that checks for newsletters with `scheduled_at <= now`:

```javascript
cron.schedule("* * * * *", async () => {
  // Find all scheduled newsletters ready to send
  // Update status to 'sending'
  // Deliver to all active subscribers
  // Log results per subscriber
});
```

### Email Delivery

Each email includes an unsubscribe link with a unique token per subscriber. In demo mode (no SMTP configured), Ethereal generates preview URLs for testing.

### Database Schema

```
subscribers:  id, email, name, token, is_active, subscribed_at, unsubscribed_at
newsletters:  id, subject, content, status, scheduled_at, sent_at, created_at
send_logs:    id, newsletter_id, subscriber_id, status, error_message, sent_at
```

## API Endpoints

### Subscribers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subscribers` | List all active subscribers |
| `POST` | `/api/subscribers/subscribe` | Subscribe with email and name |
| `GET` | `/api/subscribers/unsubscribe/:token` | Unsubscribe via token (email link) |
| `POST` | `/api/subscribers/unsubscribe` | Unsubscribe via email address |

### Newsletters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/newsletters` | List all newsletters |
| `GET` | `/api/newsletters/:id` | Get newsletter details |
| `POST` | `/api/newsletters` | Create a new draft |
| `PUT` | `/api/newsletters/:id` | Update a draft newsletter |
| `DELETE` | `/api/newsletters/:id` | Delete a draft newsletter |
| `POST` | `/api/newsletters/:id/send` | Send immediately to all subscribers |
| `POST` | `/api/newsletters/:id/schedule` | Schedule for a future date/time |
| `GET` | `/api/newsletters/:id/logs` | View delivery logs |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api-docs` | Swagger UI documentation |

## Project Structure

```
src/
├── config/
│   ├── database.js          # SQLite setup & table creation
│   ├── mailer.js            # Nodemailer transporter configuration
│   └── swagger.js           # Swagger/OpenAPI configuration
├── controllers/
│   ├── subscriberController.js
│   └── newsletterController.js
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── validate.js          # express-validator middleware
├── models/
│   ├── subscriber.js        # Subscriber database operations
│   └── newsletter.js        # Newsletter & send log operations
├── routes/
│   ├── subscriberRoutes.js
│   └── newsletterRoutes.js
├── services/
│   ├── emailService.js      # Newsletter sending logic
│   └── schedulerService.js  # Cron job for scheduled sends
├── app.js                   # Express app configuration
└── server.js                # Entry point & bootstrap
```

## Customization

### Configure SMTP Provider

You can use any SMTP provider by updating the `.env` file:

```env
# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Outlook
SMTP_HOST=smtp.office365.com
SMTP_PORT=587

# Custom SMTP
SMTP_HOST=your-smtp-server.com
SMTP_PORT=465
```

### Modify Cron Schedule

Change the cron expression in `src/services/schedulerService.js` to adjust the check interval:

```javascript
// Every 5 minutes instead of every minute
cron.schedule("*/5 * * * *", checkScheduledNewsletters);
```

### Customize Email Template

Edit the HTML template in `src/services/emailService.js` to match your brand's design and style.

## Features in Detail

### Completed Features

- ✅ Subscriber management with email validation
- ✅ Newsletter CRUD operations with draft status
- ✅ Immediate newsletter sending to all active subscribers
- ✅ Scheduled newsletter delivery with cron jobs
- ✅ Per-subscriber delivery logging with error tracking
- ✅ Unique unsubscribe tokens per subscriber
- ✅ Swagger/OpenAPI interactive documentation
- ✅ Demo mode with Ethereal for testing without SMTP
- ✅ Request validation with express-validator
- ✅ Global error handling middleware
- ✅ Render.com deployment configuration

### Future Features

- 🔮 [ ] Email template builder with drag-and-drop
- 🔮 [ ] Subscriber segmentation and tagging
- 🔮 [ ] Open/click tracking analytics
- 🔮 [ ] Rate limiting and throttling
- 🔮 [ ] Admin dashboard UI
- 🔮 [ ] Bulk import/export subscribers (CSV)
- 🔮 [ ] Webhook integrations

## Contributing

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes using conventional commits:
   - `feat:` — New feature
   - `fix:` — Bug fix
   - `refactor:` — Code refactoring
   - `docs:` — Documentation changes
   - `chore:` — Maintenance tasks
4. **Push** to the branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Acknowledgments

- [Express.js](https://expressjs.com/) — Web framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite driver
- [Nodemailer](https://nodemailer.com/) — Email sending library
- [node-cron](https://github.com/node-cron/node-cron) — Task scheduler
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) — API documentation
- [Ethereal Email](https://ethereal.email/) — Fake SMTP for testing
- [Render](https://render.com/) — Cloud deployment platform

## Contact

- [Open an Issue](https://github.com/Serkanbyx/Newsletter-System/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
