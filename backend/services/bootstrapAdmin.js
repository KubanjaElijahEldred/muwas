const User = require('../models/User');

const parseBooleanEnv = (value, defaultValue) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const ensureDefaultAdmin = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const autoSeedAdmin = parseBooleanEnv(process.env.AUTO_SEED_ADMIN, !isProduction);

  if (!autoSeedAdmin) {
    return {
      seeded: false,
      updated: false,
      skipped: true,
      reason: 'disabled',
    };
  }

  const email = String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@muwasdistilling.ug')
    .trim()
    .toLowerCase();
  const password = String(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123');
  const name = String(process.env.DEFAULT_ADMIN_NAME || 'Admin User').trim() || 'Admin User';

  if (!email) {
    return {
      seeded: false,
      updated: false,
      skipped: true,
      reason: 'missing_email',
    };
  }

  if (password.length < 6) {
    return {
      seeded: false,
      updated: false,
      skipped: true,
      reason: 'password_too_short',
    };
  }

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = new User({
      name,
      email,
      password,
      role: 'admin',
      isApproved: true,
      authProvider: 'local',
    });

    await admin.save();

    return {
      seeded: true,
      updated: false,
      email,
    };
  }

  let updated = false;

  if (admin.role !== 'admin') {
    admin.role = 'admin';
    updated = true;
  }

  if (!admin.isApproved) {
    admin.isApproved = true;
    updated = true;
  }

  if (admin.authProvider !== 'local') {
    admin.authProvider = 'local';
    updated = true;
  }

  if (!admin.password) {
    admin.password = password;
    updated = true;
  }

  if (updated) {
    await admin.save();
  }

  return {
    seeded: false,
    updated,
    skipped: false,
    email,
  };
};

module.exports = {
  ensureDefaultAdmin,
};
