import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import analysisRoutes from './routes/analysis.js';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import { initDatabase } from './models/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'db-audit-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (must be before static files)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analysis', analysisRoutes);

// Serve specific pages (before static files)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/home', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../public/home.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/upload', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  // Redirect to dashboard since upload is now part of dashboard
  res.redirect('/dashboard');
});

app.get('/contact', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, '../public/contact.html'));
});

// Static files (after routes)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database Audit Tool ready for use`);
    console.log(`\n👉 Open your browser and go to: http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
