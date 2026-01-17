import express from 'express';
import { getUserAnalysisHistory } from '../models/database.js';

const router = express.Router();

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: 'Not authenticated', 
      message: 'Please log in to access this resource' 
    });
  }
  next();
}

// GET /api/dashboard/history - Get user's analysis history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const dbType = req.query.dbType || null;

    const history = await getUserAnalysisHistory(userId, dbType);

    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history', 
      message: error.message 
    });
  }
});

export default router;
