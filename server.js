require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const { connectDB, isDBConnected } = require('./config/db');
const { desserts } = require('./lib/catalog');
const rateLimit = require('./lib/rateLimit');
const MongoSessionStore = require('./lib/MongoSessionStore');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { router: authRoutes } = require('./routes/authRoutes');

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

if (isProd && !process.env.SESSION_SECRET) {
  console.error('[Fatal] SESSION_SECRET must be set in production.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render/Railway/etc. sit behind a reverse proxy

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (isProd) res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

// The frontend is served by this same server, so CORS is only needed if you
// host the frontend somewhere else. Set CORS_ORIGIN to that site's URL.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(','), credentials: true }));
}

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

async function start() {
  await connectDB();

  app.use(
    session({
      name: 'dd.sid',
      secret: process.env.SESSION_SECRET || 'dessert-delight-development-secret',
      resave: false,
      saveUninitialized: false,
      store: isDBConnected() ? new MongoSessionStore() : undefined, // MemoryStore only in dev without MongoDB
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd, // HTTPS only in production
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // Rate limits on endpoints that are easy to abuse
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many attempts. Please try again in a few minutes.' });
  const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.post('/api/contact', formLimiter);
  app.post('/api/feedback', formLimiter);

  // Health check (used by the hosting platform)
  app.get('/api/health', (req, res) => {
    const dbOk = isDBConnected();
    res.status(isProd && !dbOk ? 503 : 200).json({
      status: dbOk ? 'OK' : 'DEGRADED',
      database: dbOk ? 'connected' : 'in-memory (development only)',
      timestamp: new Date().toISOString(),
    });
  });

  // API
  app.use('/api/auth', authRoutes);
  app.get('/api/desserts', (req, res) => {
    const { category, search } = req.query;
    let result = desserts;
    if (category && String(category).toLowerCase() !== 'all') {
      result = result.filter((d) => d.category.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase().trim();
      result = result.filter((d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
    }
    res.json({ success: true, count: result.length, desserts: result });
  });
  app.use('/api/orders', orderRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found' }));

  // Frontend (only the public/ folder is exposed, not server code)
  app.get('/', (req, res) => res.redirect('/login.html'));
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '1h' : 0 }));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  app.listen(PORT, () => {
    console.log(`Dessert Delight running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

start().catch((err) => {
  console.error('[Fatal] Failed to start server:', err.message);
  process.exit(1);
});
