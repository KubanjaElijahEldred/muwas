require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const wholesaleRoutes = require('./routes/wholesale');
const { ensureDefaultCatalog } = require('./services/bootstrapCatalog');
const { ensureDefaultAdmin } = require('./services/bootstrapAdmin');

const app = express();
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && localhostOriginPattern.test(origin)) {
    return true;
  }

  return false;
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(limiter);
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/wholesale', wholesaleRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    databaseConnected: mongoose.connection.readyState === 1,
    databaseReadyState: mongoose.connection.readyState,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const DB_RETRY_DELAY_MS = Number.parseInt(process.env.DB_RETRY_DELAY_MS || '3000', 10);
const DB_MAX_RETRIES = Number.parseInt(process.env.DB_MAX_RETRIES || '10', 10);
const DB_RECONNECT_INTERVAL_MS = Number.parseInt(
  process.env.DB_RECONNECT_INTERVAL_MS || '30000',
  10
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

const ALLOW_START_WITHOUT_DB = parseBooleanEnv(
  process.env.ALLOW_START_WITHOUT_DB,
  process.env.NODE_ENV !== 'production'
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getMongoTargetType = (uri = '') => {
  if (/^mongodb\+srv:\/\//i.test(uri)) {
    return 'atlas/srv';
  }

  if (/(localhost|127\.0\.0\.1)/i.test(uri)) {
    return 'localhost';
  }

  return 'custom';
};

let hasRunDatabaseBootstraps = false;
let dbReconnectTimer = null;

async function connectToDatabase({ maxRetries = DB_MAX_RETRIES } = {}) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Configure it in backend/.env');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri);
      const mongoType = getMongoTargetType(mongoUri);
      const connectedHost = mongoose.connection?.host || 'unknown-host';
      const connectedDb = mongoose.connection?.name || 'unknown-db';
      console.log(
        `Connected to MongoDB (${mongoType}) host=${connectedHost} db=${connectedDb}`
      );
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed:`,
        error?.message || error
      );

      if (isLastAttempt) {
        throw error;
      }

      await wait(DB_RETRY_DELAY_MS);
    }
  }
}

async function runDatabaseBootstraps() {
  if (hasRunDatabaseBootstraps) {
    return;
  }

  const catalogStatus = await ensureDefaultCatalog();

  if (catalogStatus.seeded) {
    console.log(`Seeded ${catalogStatus.count} default products because the catalog was empty`);
  }

  const adminStatus = await ensureDefaultAdmin();

  if (adminStatus.seeded) {
    console.log(`Seeded default admin account (${adminStatus.email}) for local development`);
  } else if (adminStatus.updated) {
    console.log(`Updated default admin account privileges (${adminStatus.email})`);
  } else if (adminStatus.skipped && adminStatus.reason) {
    console.log(`Skipped default admin bootstrap: ${adminStatus.reason}`);
  }

  hasRunDatabaseBootstraps = true;
}

function startDatabaseReconnectLoop() {
  if (!ALLOW_START_WITHOUT_DB || dbReconnectTimer) {
    return;
  }

  dbReconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    try {
      await connectToDatabase({ maxRetries: 1 });
      await runDatabaseBootstraps();
      console.log('Database reconnect succeeded. API is fully online.');
    } catch (error) {
      console.error('Database reconnect attempt failed:', error?.message || error);
    }
  }, DB_RECONNECT_INTERVAL_MS);
}

async function startServer() {
  const startupRetries = ALLOW_START_WITHOUT_DB ? 1 : DB_MAX_RETRIES;
  let databaseConnected = false;

  try {
    await connectToDatabase({ maxRetries: startupRetries });
    databaseConnected = true;
    await runDatabaseBootstraps();
  } catch (err) {
    if (!ALLOW_START_WITHOUT_DB) {
      console.error('Server startup error:', err);
      process.exit(1);
      return;
    }

    console.error(
      'Database unavailable at startup. Starting API in fallback mode:',
      err?.message || err
    );
    startDatabaseReconnectLoop();
  }

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}${
        databaseConnected ? '' : ' (fallback mode without database)'
      }`
    );
  });
}

startServer();
