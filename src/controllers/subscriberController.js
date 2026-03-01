const { v4: uuidv4 } = require("uuid");
const Subscriber = require("../models/subscriber");
const { AppError } = require("../middleware/errorHandler");

const getAll = (req, res) => {
  const includeInactive = req.query.all === "true";
  const subscribers = Subscriber.findAll(!includeInactive);
  res.json({
    success: true,
    count: subscribers.length,
    data: subscribers,
  });
};

const subscribe = (req, res, next) => {
  try {
    const { email, name } = req.body;

    const existing = Subscriber.findByEmail(email);

    if (existing && existing.is_active) {
      throw new AppError("This email is already subscribed", 409);
    }

    // Reactivate if previously unsubscribed
    if (existing && !existing.is_active) {
      const reactivated = Subscriber.reactivate(existing.id);
      return res.json({
        success: true,
        message: "Subscription reactivated successfully",
        data: {
          id: reactivated.id,
          email: reactivated.email,
          name: reactivated.name,
        },
      });
    }

    const token = uuidv4();
    const subscriber = Subscriber.create({ email, name, token });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const unsubscribeByToken = (req, res, next) => {
  try {
    const { token } = req.params;
    const success = Subscriber.deactivate(token);

    if (!success) {
      throw new AppError("Invalid token or already unsubscribed", 404);
    }

    res.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const unsubscribeByEmail = (req, res, next) => {
  try {
    const { email } = req.body;
    const subscriber = Subscriber.findByEmail(email);

    if (!subscriber || !subscriber.is_active) {
      throw new AppError("Email not found or already unsubscribed", 404);
    }

    Subscriber.deactivate(subscriber.token);

    res.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, subscribe, unsubscribeByToken, unsubscribeByEmail };
