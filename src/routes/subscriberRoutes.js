const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { strictLimiter } = require("../middleware/rateLimiter");
const ctrl = require("../controllers/subscriberController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscribers
 *   description: Subscriber management
 */

/**
 * @swagger
 * /api/subscribers:
 *   get:
 *     summary: Get all subscribers
 *     tags: [Subscribers]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Include inactive subscribers
 *     responses:
 *       200:
 *         description: List of subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscriber'
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /api/subscribers/subscribe:
 *   post:
 *     summary: Subscribe to the newsletter
 *     tags: [Subscribers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *       409:
 *         description: Email already subscribed
 */
router.post(
  "/subscribe",
  strictLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("name").trim().notEmpty().withMessage("Name is required"),
  ],
  validate,
  ctrl.subscribe
);

/**
 * @swagger
 * /api/subscribers/unsubscribe/{token}:
 *   get:
 *     summary: Unsubscribe via token link (from email)
 *     tags: [Subscribers]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique unsubscribe token
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       404:
 *         description: Invalid token or already unsubscribed
 */
router.get("/unsubscribe/:token", ctrl.unsubscribeByToken);

/**
 * @swagger
 * /api/subscribers/unsubscribe:
 *   post:
 *     summary: Unsubscribe via email address
 *     tags: [Subscribers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       404:
 *         description: Email not found or already unsubscribed
 */
router.post(
  "/unsubscribe",
  [body("email").isEmail().normalizeEmail().withMessage("Valid email is required")],
  validate,
  ctrl.unsubscribeByEmail
);

module.exports = router;
