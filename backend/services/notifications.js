const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createNotification = async ({
  recipientId = null,
  audience = 'user',
  title,
  message,
  type = 'info',
  metadata = {},
}) => {
  if (!isDatabaseReady() || !title || !message) {
    return null;
  }

  return Notification.create({
    recipientId,
    audience,
    title,
    message,
    type,
    metadata,
  });
};

const createAdminNotification = async (payload) =>
  createNotification({
    ...payload,
    recipientId: null,
    audience: 'admin',
  });

const createGlobalNotification = async (payload) =>
  createNotification({
    ...payload,
    recipientId: null,
    audience: 'all',
  });

module.exports = {
  createNotification,
  createAdminNotification,
  createGlobalNotification,
};
