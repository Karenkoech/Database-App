import express from 'express';
import { createRequire } from 'module';
import { getUserByUsername, getUserByEmail, createUser } from '../models/database.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');
const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        message: 'Username and password are required' 
      });
    }

    const user = await getUserByUsername(username);
    
    if (!user) {
      console.log(`Login attempt failed: User '${username}' not found`);
      return res.status(401).json({ 
        error: 'Invalid credentials', 
        message: 'Username or password is incorrect' 
      });
    }

    // Check if password_hash exists
    if (!user.password_hash) {
      console.error(`Login attempt failed: User '${username}' has no password hash`);
      return res.status(500).json({ 
        error: 'Authentication error', 
        message: 'User account error. Please contact administrator.' 
      });
    }

    // Compare password using promise
    try {
      const isMatch = await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password_hash, (err, result) => {
          if (err) {
            console.error('Password comparison error:', err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      if (!isMatch) {
        console.log(`Login attempt failed: Incorrect password for user '${username}'`);
        return res.status(401).json({ 
          error: 'Invalid credentials', 
          message: 'Username or password is incorrect' 
        });
      }
      
      console.log(`✅ Successful login for user '${username}'`);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.fullName = user.full_name;

      res.json({
        success: true,
        redirect: '/home', // Redirect to home page after login
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name
        }
      });
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(500).json({ 
        error: 'Authentication error', 
        message: 'Failed to verify password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      message: error.message 
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Logout failed', 
        message: 'Failed to destroy session' 
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Username, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email', 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Weak password', 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username exists', 
        message: 'Username already taken. Please choose another one.' 
      });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        error: 'Email exists', 
        message: 'Email already registered. Please use a different email.' 
      });
    }

    // Create user
    try {
      const newUser = await createUser({ username, email, password, fullName });

      // Auto-login after registration
      req.session.userId = newUser.id;
      req.session.username = newUser.username;
      req.session.fullName = newUser.fullName;

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        redirect: '/home', // Redirect to home page after registration
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName
        }
      });
    } catch (createError) {
      console.error('User creation error:', createError);
      // Handle specific error messages
      if (createError.message === 'Username already exists' || 
          createError.message === 'Email already exists' ||
          createError.message === 'User already exists') {
        return res.status(409).json({
          error: 'User exists',
          message: createError.message
        });
      }
      throw createError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Registration error:', error);
    const statusCode = error.message && (
      error.message.includes('already exists') || 
      error.message.includes('UNIQUE constraint')
    ) ? 409 : 500;
    
    res.status(statusCode).json({ 
      error: 'Registration failed', 
      message: error.message || 'Failed to create account' 
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Not authenticated', 
      message: 'Please log in' 
    });
  }

  res.json({
    success: true,
    user: {
      id: req.session.userId,
      username: req.session.username,
      fullName: req.session.fullName
    }
  });
});

export default router;
