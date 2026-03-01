const Newsletter = require("../models/newsletter");
const { sendNewsletter } = require("../services/emailService");
const { AppError } = require("../middleware/errorHandler");

const getAll = (_req, res) => {
  const newsletters = Newsletter.findAll();
  res.json({ success: true, count: newsletters.length, data: newsletters });
};

const getById = (req, res, next) => {
  try {
    const newsletter = Newsletter.findById(req.params.id);
    if (!newsletter) throw new AppError("Newsletter not found", 404);
    res.json({ success: true, data: newsletter });
  } catch (error) {
    next(error);
  }
};

const create = (req, res, next) => {
  try {
    const { subject, content } = req.body;
    const newsletter = Newsletter.create({ subject, content });
    res.status(201).json({ success: true, data: newsletter });
  } catch (error) {
    next(error);
  }
};

const update = (req, res, next) => {
  try {
    const newsletter = Newsletter.findById(req.params.id);
    if (!newsletter) throw new AppError("Newsletter not found", 404);
    if (newsletter.status !== "draft") {
      throw new AppError("Only draft newsletters can be edited", 400);
    }

    const { subject, content } = req.body;
    const updated = Newsletter.update(req.params.id, { subject, content });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const remove = (req, res, next) => {
  try {
    const success = Newsletter.delete(req.params.id);
    if (!success) {
      throw new AppError("Newsletter not found or cannot be deleted", 404);
    }
    res.json({ success: true, message: "Newsletter deleted" });
  } catch (error) {
    next(error);
  }
};

const schedule = (req, res, next) => {
  try {
    const newsletter = Newsletter.findById(req.params.id);
    if (!newsletter) throw new AppError("Newsletter not found", 404);
    if (newsletter.status !== "draft") {
      throw new AppError("Only draft newsletters can be scheduled", 400);
    }

    const { scheduledAt } = req.body;
    if (new Date(scheduledAt) <= new Date()) {
      throw new AppError("Scheduled time must be in the future", 400);
    }

    const updated = Newsletter.schedule(req.params.id, scheduledAt);
    res.json({
      success: true,
      message: `Newsletter scheduled for ${scheduledAt}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const sendNow = async (req, res, next) => {
  try {
    const newsletter = Newsletter.findById(req.params.id);
    if (!newsletter) throw new AppError("Newsletter not found", 404);
    if (newsletter.status === "sent") {
      throw new AppError("Newsletter already sent", 400);
    }

    const result = await sendNewsletter(req.params.id);
    res.json({
      success: true,
      message: "Newsletter sent",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getLogs = (req, res, next) => {
  try {
    const newsletter = Newsletter.findById(req.params.id);
    if (!newsletter) throw new AppError("Newsletter not found", 404);

    const logs = Newsletter.getLogs(req.params.id);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove, schedule, sendNow, getLogs };
