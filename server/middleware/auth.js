const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusradar_super_secret_jwt_key_2026_exhibition_prototype');
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

// Optional auth - sets req.user if token valid, but doesn't block if unauthenticated
const optionalToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusradar_super_secret_jwt_key_2026_exhibition_prototype');
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) req.user = user;
    } catch (e) {
      // ignore
    }
  }
  next();
};

module.exports = { verifyToken, optionalToken };
