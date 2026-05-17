const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');
const { createAdminNotification } = require('../services/notifications');

const router = express.Router();

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const getSourceLabel = (user) => {
  const role = String(user?.role || 'customer')
    .trim()
    .toLowerCase();
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);
  const name = String(user?.name || '').trim();
  const email = String(user?.email || '').trim();

  if (name) {
    return `${roleName}: ${name}${email ? ` (${email})` : ''}`;
  }

  return `${roleName}${email ? `: ${email}` : ''}`;
};

router.post('/', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ message: 'Database is not ready.' });
    }

    const rating = Number.parseInt(req.body?.rating, 10);
    const comment = String(req.body?.comment || '').trim();
    const source = String(req.body?.source || 'checkout').trim().slice(0, 80);
    const orderId = String(req.body?.orderId || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    let resolvedOrderId = null;
    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order id.' });
      }

      const order = await Order.findById(orderId).select('userId');
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const ownerId = String(order.userId || '');
      const requesterId = String(req.user?._id || '');
      if (req.user?.role !== 'admin' && ownerId !== requesterId) {
        return res.status(403).json({ message: 'You can only review your own orders.' });
      }

      resolvedOrderId = order._id;
    }

    const sourceLabel = getSourceLabel(req.user);
    const feedback = await Feedback.create({
      userId: req.user._id,
      orderId: resolvedOrderId,
      rating,
      comment,
      source,
      sourceLabel,
    });

    await createAdminNotification({
      title: 'New customer feedback',
      message: `${sourceLabel} rated ${rating}/5`,
      type: rating >= 4 ? 'success' : rating <= 2 ? 'warning' : 'info',
      metadata: {
        source: 'customer-feedback',
        sourceLabel,
        rating,
        feedbackId: feedback._id,
      },
    });

    return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({ message: 'Failed to submit feedback.' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ feedback: [] });
    }

    const parsedLimit = Math.max(1, Math.min(Number(req.query.limit) || 200, 500));
    const feedback = await Feedback.find({})
      .populate('userId', 'name email role')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    return res.json({ feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    return res.status(500).json({ message: 'Failed to load feedback.' });
  }
});

module.exports = router;
