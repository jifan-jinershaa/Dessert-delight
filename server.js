const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const contactRoutes = require('./routes/contactRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { router: authRoutes } = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dessert-delight-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

// Authentication API
app.use('/api/auth', authRoutes);

// The login page is the public entry point.
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Dessert Delight API is running',
    timestamp: new Date().toISOString(),
  });
});

// Desserts Catalog API
app.get('/api/desserts', (req, res) => {
  try {
    const dessertsFilePath = path.join(__dirname, 'data', 'desserts.json');
    if (!fs.existsSync(dessertsFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'Desserts data source not found.',
      });
    }

    const rawData = fs.readFileSync(dessertsFilePath, 'utf-8');
    const desserts = JSON.parse(rawData);

    // Optional query filtering by category
    const { category, search } = req.query;
    let filtered = desserts;

    if (category && category.toLowerCase() !== 'all') {
      filtered = filtered.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      desserts: filtered,
    });
  } catch (error) {
    console.error('Error reading desserts data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve desserts.',
    });
  }
});

// Register Modular Routes
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Dessert Delight Server is running!    `);
  console.log(`  Port: ${PORT}                          `);
  console.log(`  Local URL: http://localhost:${PORT}    `);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
