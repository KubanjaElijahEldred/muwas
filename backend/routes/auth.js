const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { createAdminNotification } = require('../services/notifications');

const router = express.Router();
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const vercelOriginPattern = /^https:\/\/[\w-]+\.vercel\.app$/i;

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const fileToDataUrl = (file) => {
  if (!file?.buffer || !file?.mimetype) {
    return undefined;
  }

  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

const getQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const getConfiguredFrontendOrigins = () => {
  const origins = new Set(
    (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .map((origin) => String(origin || '').trim())
    .filter(Boolean)
    .forEach((origin) => {
      origins.add(origin.startsWith('http') ? origin : `https://${origin}`);
    });

  return Array.from(origins);
};

const getFrontendBaseUrl = () => {
  const configuredOrigins = getConfiguredFrontendOrigins();

  return configuredOrigins[0] || 'http://localhost:5173';
};

const isAllowedFrontendOrigin = (origin = '') => {
  if (!origin) {
    return false;
  }

  if (getConfiguredFrontendOrigins().includes(origin)) {
    return true;
  }

  if (localhostOriginPattern.test(origin)) {
    return true;
  }

  if (process.env.ALLOW_VERCEL_PREVIEW_ORIGINS !== 'false' && vercelOriginPattern.test(origin)) {
    return true;
  }

  return false;
};

const resolveFrontendRedirect = (requestedRedirect = '') => {
  const fallbackRedirect = new URL('/login', getFrontendBaseUrl()).toString();

  if (!requestedRedirect || typeof requestedRedirect !== 'string') {
    return fallbackRedirect;
  }

  try {
    if (requestedRedirect.startsWith('/')) {
      return new URL(requestedRedirect, getFrontendBaseUrl()).toString();
    }

    const parsedRedirect = new URL(requestedRedirect);

    if (!isAllowedFrontendOrigin(parsedRedirect.origin)) {
      return fallbackRedirect;
    }

    return parsedRedirect.toString();
  } catch (error) {
    return fallbackRedirect;
  }
};

const encodeGoogleState = (payload = {}) =>
  Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const decodeGoogleState = (encodedState = '') => {
  if (!encodedState || typeof encodedState !== 'string') {
    return {};
  }

  try {
    const normalizedState = encodedState.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalizedState.length % 4)) % 4);
    const decodedPayload = Buffer.from(`${normalizedState}${padding}`, 'base64').toString('utf8');
    const parsedPayload = JSON.parse(decodedPayload);
    return parsedPayload && typeof parsedPayload === 'object' ? parsedPayload : {};
  } catch (error) {
    return {};
  }
};

const buildFrontendLoginRedirect = (params = {}, redirectTarget = '/login') => {
  const redirectUrl = new URL(resolveFrontendRedirect(redirectTarget));

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      redirectUrl.searchParams.set(key, String(value));
    }
  });

  return redirectUrl.toString();
};

const getGoogleRedirectUri = (req) => {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
};

const normalizeEmail = (value = '') => String(value || '').trim().toLowerCase();
const isDatabaseReady = () => mongoose.connection.readyState === 1;
const normalizeUsername = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const signUserToken = (user, additionalClaims = {}) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      ...additionalClaims,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const parseBooleanEnv = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
};

const getSuperAdminConfig = () => ({
  enabled: parseBooleanEnv(process.env.SUPER_ADMIN_ENABLED, true),
  email: normalizeEmail(process.env.SUPER_ADMIN_EMAIL || 'bryan@muwas.ca'),
  username: normalizeUsername(process.env.SUPER_ADMIN_USERNAME || 'bryan anderson'),
  name: String(process.env.SUPER_ADMIN_NAME || 'Bryan Anderson').trim() || 'Bryan Anderson',
});

const buildSuperAdminUser = () => {
  const superAdminConfig = getSuperAdminConfig();

  return {
    _id: 'super-admin',
    name: superAdminConfig.name,
    email: superAdminConfig.email,
    role: 'admin',
    isApproved: true,
    authProvider: 'local',
    isSuperAdmin: true,
  };
};

router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({
        message: 'Service temporarily unavailable. Database connection is not ready.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Server auth configuration is incomplete (missing JWT secret).',
      });
    }

    const {
      name,
      email,
      password,
      role = 'customer',
      phone,
      address,
      adminInviteCode,
    } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const requestedRole = String(role || 'customer').trim().toLowerCase();
    const allowAdminSelfRegister = parseBooleanEnv(
      process.env.ALLOW_ADMIN_SELF_REGISTER,
      process.env.NODE_ENV !== 'production'
    );
    const configuredAdminInviteCode = String(process.env.ADMIN_INVITE_CODE || '').trim();
    const isWholesaleRequest = requestedRole === 'wholesale';
    const isAdminRequest = requestedRole === 'admin';

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (isAdminRequest && !allowAdminSelfRegister) {
      return res.status(403).json({
        message:
          'Admin self-registration is disabled. Ask an existing admin to grant access.',
      });
    }

    if (
      isAdminRequest &&
      configuredAdminInviteCode &&
      String(adminInviteCode || '').trim() !== configuredAdminInviteCode
    ) {
      return res.status(403).json({ message: 'Invalid admin invite code.' });
    }

    const resolvedRole = isAdminRequest
      ? 'admin'
      : isWholesaleRequest
        ? 'wholesale'
        : 'customer';
    const isApproved = resolvedRole === 'wholesale' ? false : true;

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      authProvider: 'local',
      role: resolvedRole,
      isApproved,
      phone,
      address,
      profileImage: fileToDataUrl(req.file)
    });

    await user.save();

    await createAdminNotification({
      title: 'New Account Created',
      message: `${user.name || user.email} registered as ${user.role}.`,
      type: user.role === 'wholesale' ? 'warning' : 'info',
      metadata: {
        userId: user._id,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

    const token = signUserToken(user);

    res.status(201).json({
      message: resolvedRole === 'wholesale'
        ? 'Registration successful. Your wholesale account is pending approval.'
        : resolvedRole === 'admin'
          ? 'Admin registration successful.'
          : 'Registration successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Server auth configuration is incomplete (missing JWT secret).',
      });
    }

    const { email, password, username } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username || password);

    if (!normalizedEmail || !normalizedUsername) {
      return res.status(400).json({ message: 'Email and password/username are required' });
    }

    const superAdminConfig = getSuperAdminConfig();

    if (
      superAdminConfig.enabled &&
      normalizedEmail === superAdminConfig.email &&
      normalizedUsername === superAdminConfig.username
    ) {
      const superAdminUser = buildSuperAdminUser();
      const token = signUserToken(superAdminUser, { isSuperAdmin: true });

      return res.json({
        message: 'Super admin login successful',
        token,
        user: superAdminUser,
      });
    }

    if (!isDatabaseReady()) {
      return res.status(503).json({
        message: 'Service temporarily unavailable. Database connection is not ready.',
      });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required for this account' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({
        message: 'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isApproved && user.role !== 'admin') {
      return res.status(401).json({ message: 'Account not approved' });
    }

    const token = signUserToken(user);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/google/start', (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const requestedFrontendRedirect = resolveFrontendRedirect(
    getQueryValue(req.query.redirect) ||
      getQueryValue(req.query.redirect_url) ||
      getQueryValue(req.query.frontend_redirect)
  );

  if (!googleClientId) {
    return res.redirect(
      buildFrontendLoginRedirect(
        { oauth: 'google', oauth_error: 'google_not_configured' },
        requestedFrontendRedirect
      )
    );
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', getGoogleRedirectUri(req));
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('include_granted_scopes', 'true');
  googleAuthUrl.searchParams.set(
    'state',
    encodeGoogleState({ redirect: requestedFrontendRedirect })
  );

  res.redirect(googleAuthUrl.toString());
});

router.get('/google/callback', async (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const statePayload = decodeGoogleState(getQueryValue(req.query.state) || '');
  const frontendRedirect = resolveFrontendRedirect(
    statePayload.redirect ||
      getQueryValue(req.query.redirect) ||
      getQueryValue(req.query.redirect_url) ||
      getQueryValue(req.query.frontend_redirect)
  );

  if (!googleClientId || !googleClientSecret) {
    return res.redirect(
      buildFrontendLoginRedirect(
        { oauth: 'google', oauth_error: 'google_not_configured' },
        frontendRedirect
      )
    );
  }

  const code = getQueryValue(req.query.code);
  const error = getQueryValue(req.query.error);

  if (error) {
    return res.redirect(
      buildFrontendLoginRedirect(
        { oauth: 'google', oauth_error: 'google_access_denied' },
        frontendRedirect
      )
    );
  }

  if (!code) {
    return res.redirect(
      buildFrontendLoginRedirect({ oauth: 'google', oauth_error: 'google_no_code' }, frontendRedirect)
    );
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: String(code),
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const tokenErrorPayload = await tokenResponse.text();
      throw new Error(`Google token exchange failed: ${tokenErrorPayload}`);
    }

    const tokenPayload = await tokenResponse.json();
    const idToken = tokenPayload.id_token;

    if (!idToken) {
      throw new Error('Google callback did not include an id_token');
    }

    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!verifyResponse.ok) {
      const verifyErrorPayload = await verifyResponse.text();
      throw new Error(`Google token verification failed: ${verifyErrorPayload}`);
    }

    const googleProfile = await verifyResponse.json();
    const googleEmail = String(googleProfile.email || '').trim().toLowerCase();
    const googleName = String(googleProfile.name || '').trim();
    const googleSub = String(googleProfile.sub || '').trim();

    if (!googleEmail) {
      throw new Error('Google profile does not include an email address');
    }

    if (googleProfile.aud !== googleClientId) {
      throw new Error('Google token audience does not match configured client');
    }

    if (googleProfile.email_verified !== 'true') {
      throw new Error('Google email is not verified');
    }

    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      user = new User({
        name: googleName || googleEmail.split('@')[0],
        email: googleEmail,
        password: crypto.randomBytes(24).toString('hex'),
        authProvider: 'google',
        googleId: googleSub || undefined,
        role: 'customer',
        isApproved: true,
      });
      await user.save();
    } else {
      let needsUpdate = false;

      if (googleSub && user.googleId !== googleSub) {
        user.googleId = googleSub;
        needsUpdate = true;
      }

      if (user.authProvider !== 'google' && !user.password) {
        user.authProvider = 'google';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
      }
    }

    if (!user.isApproved && user.role !== 'admin') {
      return res.redirect(
        buildFrontendLoginRedirect(
          { oauth: 'google', oauth_error: 'account_not_approved' },
          frontendRedirect
        )
      );
    }

    const token = signUserToken(user);

    res.redirect(buildFrontendLoginRedirect({ oauth: 'google', token }, frontendRedirect));
  } catch (googleAuthError) {
    console.error('Google OAuth callback error:', googleAuthError);
    res.redirect(
      buildFrontendLoginRedirect(
        { oauth: 'google', oauth_error: 'google_login_failed' },
        frontendRedirect
      )
    );
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/users', auth, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { limit = 100 } = req.query;
    const parsedLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
    const users = await User.find({})
      .select('name email role isApproved createdAt authProvider phone')
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    return res.json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get users (admin) error:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) {
      // Parse nested address object from form data
      if (typeof address === 'string') {
        try {
          updates.address = JSON.parse(address);
        } catch (e) {
          updates.address = {};
        }
      } else {
        updates.address = address;
      }
    }

    if (req.file) {
      updates.profileImage = fileToDataUrl(req.file);
    }

    let targetUserId = req.user._id;

    if (req.user?.isSuperAdmin) {
      let persistedAdmin = await User.findOne({ email: normalizeEmail(req.user.email) });

      if (!persistedAdmin) {
        persistedAdmin = new User({
          name: req.user.name || 'Admin',
          email: normalizeEmail(req.user.email),
          password: crypto.randomBytes(24).toString('hex'),
          authProvider: 'local',
          role: 'admin',
          isApproved: true,
        });
        await persistedAdmin.save();
      }

      targetUserId = persistedAdmin._id;
    }

    const user = await User.findByIdAndUpdate(
      targetUserId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
    }
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: 'Only image files are allowed.' });
    }
    
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
