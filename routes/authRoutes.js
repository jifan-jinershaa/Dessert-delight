const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { isDBConnected } = require('../config/db');

const inMemoryUsers = [];

function publicUser(user) {
  return { id: user._id || user.id, name: user.name, email: user.email, phone: user.phone || '' };
}

// New session id on every login (prevents session fixation)
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = user;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone = '', password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (typeof password !== 'string' || password.length < 6 || password.length > 72) return res.status(400).json({ success: false, message: 'Password must be between 6 and 72 characters.' });

    const normalizedEmail = email.trim().toLowerCase();
    let existing;
    if (isDBConnected()) existing = await User.findOne({ email: normalizedEmail });
    else existing = inMemoryUsers.find(u => u.email === normalizedEmail);
    if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { name: name.trim(), email: normalizedEmail, phone: phone.trim(), password: hashedPassword };
    let user;
    if (isDBConnected()) user = await User.create(data);
    else { user = { ...data, id: `USR${Date.now()}` }; inMemoryUsers.push(user); }

    await startSession(req, publicUser(user));
    res.status(201).json({ success: true, message: 'Account created successfully.', user: publicUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    let user;
    if (isDBConnected()) user = await User.findOne({ email: normalizedEmail });
    else user = inMemoryUsers.find(u => u.email === normalizedEmail);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await startSession(req, publicUser(user));
    res.json({ success: true, message: 'Welcome back!', user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Unable to log in.' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  res.json({ success: true, user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('dd.sid').json({ success: true, message: 'Logged out successfully.' }));
});

module.exports = { router, inMemoryUsers };
