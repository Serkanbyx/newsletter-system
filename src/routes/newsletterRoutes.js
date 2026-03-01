const { Router } = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { strictLimiter } = require("../middleware/rateLimiter");
const ctrl = require("../controllers/newsletterController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Newsletters
 *   description: Newsletter management and sending
 */

/**
 * @swagger
 * /api/newsletters:
 *   get:
 *     summary: Get all newsletters
 *     tags: [Newsletters]
 *     responses:
 *       200:
 *         description: List of newsletters
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
 *                     $ref: '#/components/schemas/Newsletter'
 */
router.get("/", ctrl.getAll);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   get:
 *     summary: Get a newsletter by ID
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Newsletter details
 *       404:
 *         description: Newsletter not found
 */
router.get("/:id", ctrl.getById);

/**
 * @swagger
 * /api/newsletters:
 *   post:
 *     summary: Create a new newsletter (draft)
 *     tags: [Newsletters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, content]
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "March Newsletter"
 *               content:
 *                 type: string
 *                 example: "<p>Hello subscribers! Here are our latest updates...</p>"
 *     responses:
 *       201:
 *         description: Newsletter created
 */
router.post(
  "/",
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  validate,
  ctrl.create
);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   put:
 *     summary: Update a draft newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, content]
 *             properties:
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Newsletter updated
 *       400:
 *         description: Only draft newsletters can be edited
 *       404:
 *         description: Newsletter not found
 */
router.put(
  "/:id",
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  validate,
  ctrl.update
);

/**
 * @swagger
 * /api/newsletters/{id}:
 *   delete:
 *     summary: Delete a draft newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Newsletter deleted
 *       404:
 *         description: Newsletter not found or cannot be deleted
 */
router.delete("/:id", ctrl.remove);

/**
 * @swagger
 * /api/newsletters/{id}/schedule:
 *   post:
 *     summary: Schedule a newsletter for future sending
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduledAt]
 *             properties:
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-15T10:00:00Z"
 *     responses:
 *       200:
 *         description: Newsletter scheduled
 *       400:
 *         description: Only draft newsletters can be scheduled / Time must be in the future
 */
router.post(
  "/:id/schedule",
  strictLimiter,
  [
    body("scheduledAt")
      .notEmpty()
      .withMessage("scheduledAt is required")
      .isISO8601()
      .withMessage("scheduledAt must be a valid ISO 8601 date"),
  ],
  validate,
  ctrl.schedule
);

/**
 * @swagger
 * /api/newsletters/{id}/send:
 *   post:
 *     summary: Send a newsletter immediately
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Newsletter sent with delivery report
 *       400:
 *         description: Newsletter already sent
 *       404:
 *         description: Newsletter not found
 */
router.post("/:id/send", strictLimiter, ctrl.sendNow);

/**
 * @swagger
 * /api/newsletters/{id}/logs:
 *   get:
 *     summary: Get send logs for a newsletter
 *     tags: [Newsletters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Send logs for the newsletter
 *       404:
 *         description: Newsletter not found
 */
router.get("/:id/logs", ctrl.getLogs);

module.exports = router;
