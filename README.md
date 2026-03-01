# Newsletter System

Email automation backend built with **Node.js**, **Express**, **SQLite**, **Nodemailer**, and **Cron Jobs**.

## Features

- **Subscribe / Unsubscribe** — manage newsletter subscribers with email validation
- **Newsletter CRUD** — create, update, delete draft newsletters
- **Send Immediately** — send a newsletter to all active subscribers now
- **Schedule Sending** — schedule newsletters for a future date/time (cron job checks every minute)
- **Send Logs** — track delivery status per subscriber per newsletter
- **Swagger UI** — interactive API documentation

## Tech Stack

| Technology | Purpose |
|---|---|
| Express | HTTP server & routing |
| better-sqlite3 | SQLite database |
| Nodemailer | Email sending |
| node-cron | Scheduled task execution |
| swagger-jsdoc + swagger-ui-express | API documentation |
| express-validator | Request validation |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your SMTP credentials:

```bash
cp .env.example .env
```

For **Gmail**, use an [App Password](https://myaccount.google.com/apppasswords) (not your regular password).

### 3. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 4. Open Swagger UI

Navigate to [http://localhost:3000/api-docs](http://localhost:3000/api-docs) to explore and test the API.

## API Endpoints

### Subscribers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscribers` | List all subscribers |
| `POST` | `/api/subscribers/subscribe` | Subscribe with email & name |
| `GET` | `/api/subscribers/unsubscribe/:token` | Unsubscribe via token (email link) |
| `POST` | `/api/subscribers/unsubscribe` | Unsubscribe via email |

### Newsletters

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/newsletters` | List all newsletters |
| `GET` | `/api/newsletters/:id` | Get newsletter details |
| `POST` | `/api/newsletters` | Create a new draft |
| `PUT` | `/api/newsletters/:id` | Update a draft |
| `DELETE` | `/api/newsletters/:id` | Delete a draft |
| `POST` | `/api/newsletters/:id/send` | Send immediately |
| `POST` | `/api/newsletters/:id/schedule` | Schedule for later |
| `GET` | `/api/newsletters/:id/logs` | View send logs |

### Other

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |

## Project Structure

```
src/
├── config/
│   ├── database.js      # SQLite setup & table creation
│   ├── mailer.js         # Nodemailer transporter
│   └── swagger.js        # Swagger/OpenAPI config
├── controllers/
│   ├── subscriberController.js
│   └── newsletterController.js
├── middleware/
│   ├── errorHandler.js   # Global error handler
│   └── validate.js       # express-validator middleware
├── models/
│   ├── subscriber.js     # Subscriber DB operations
│   └── newsletter.js     # Newsletter & send log DB operations
├── routes/
│   ├── subscriberRoutes.js
│   └── newsletterRoutes.js
├── services/
│   ├── emailService.js   # Newsletter sending logic
│   └── schedulerService.js  # Cron job for scheduled sends
├── app.js                # Express app configuration
└── server.js             # Entry point & bootstrap
```
