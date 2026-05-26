const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { createGlobalNotification } = require('../services/notifications');

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));
const USER_PERSONAL_SOURCES = ['account-created', 'admin-created-account', 'payment-confirmed'];

const getAudienceFilter = (user) => {
  const recipientCondition = isObjectId(user?._id) ? [{ recipientId: user._id }] : [];

  if (user?.role === 'admin') {
    return {
      $or: [
        { audience: 'all' },
        { audience: 'admin' },
        ...recipientCondition,
      ],
    };
  }

  if (recipientCondition.length === 0) {
    return { _id: null };
  }

  return {
    $or: [
      { audience: 'all', 'metadata.source': 'admin-broadcast' },
      {
        recipientId: user._id,
        'metadata.source': { $in: USER_PERSONAL_SOURCES },
      },
    ],
  };
};

router.get('/', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const parsedLimit = Math.max(1, Math.min(Number(req.query.limit) || 30, 200));
    const audienceFilter = getAudienceFilter(req.user);
    const notifications = await Notification.find(audienceFilter)
      .sort({ createdAt: -1 })
      .limit(parsedLimit);
    const unreadCount = await Notification.countDocuments({
      ...audienceFilter,
      isRead: false,
    });
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Failed to load notifications' });
  }
});

router.patch('/read-all', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ message: 'No notifications to update.' });
    }

    await Notification.updateMany(getAudienceFilter(req.user), { $set: { isRead: true } });
    return res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
});

router.post('/read-all', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ message: 'No notifications to update.' });
    }

    await Notification.updateMany(getAudienceFilter(req.user), { $set: { isRead: true } });
    return res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ message: 'Failed to update notifications' });
  }
});

router.post('/broadcast', auth, authorize('admin'), async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const message = String(req.body?.message || '').trim();
    const requestedType = String(req.body?.type || 'info').trim().toLowerCase();
    const allowedTypes = new Set(['info', 'success', 'warning', 'error']);
    const type = allowedTypes.has(requestedType) ? requestedType : 'info';

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    if (!isDatabaseReady()) {
      return res.status(503).json({ message: 'Database is not ready.' });
    }

    await createGlobalNotification({
      title,
      message,
      type,
      metadata: {
        source: 'admin-broadcast',
        sourceLabel: 'Muwas Admin',
        senderId: req.user?._id,
      },
    });

    return res.status(201).json({ message: 'Broadcast sent successfully.' });
  } catch (error) {
    console.error('Broadcast notification error:', error);

    if (error?.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        message: firstError?.message || 'Invalid broadcast payload.',
      });
    }

    return res.status(500).json({ message: 'Failed to send broadcast notification' });
  }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...getAudienceFilter(req.user) },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({ message: 'Notification updated', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
});

router.post('/:id/read', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...getAudienceFilter(req.user) },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json({ message: 'Notification updated', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
});

module.exports = router;
