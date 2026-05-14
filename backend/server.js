const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
require('dotenv').config();

const { getDb } = require('./db'); // Initializes DB automatically

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Morgan logger for terminal visibility
app.use(morgan('dev'));

// Custom Request Logger Middleware (Keep for extra detail if needed)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Basic test route
app.get('/api/status', (req, res) => {
  res.json({ message: 'WealthPilot Backend is running!', status: 'success' });
});

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Backend Validation
  if (!email || !password) {
    console.warn(`[Login] Missing credentials attempt: ${new Date().toISOString()}`);
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const db = await getDb();
    
    // Check Database
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      console.warn(`[Login] Invalid email attempt: ${email} at ${new Date().toISOString()}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify Password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.warn(`[Login] Wrong password attempt for: ${email} at ${new Date().toISOString()}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`[Login] Successful login for: ${email} at ${new Date().toISOString()}`);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
