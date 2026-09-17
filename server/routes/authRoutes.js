const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register a user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, clubAffiliation, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'Student',
      clubAffiliation: clubAffiliation || '',
      department: department || ''
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'campusradar_super_secret_jwt_key_2026_exhibition_prototype',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubAffiliation: user.clubAffiliation,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup.', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'campusradar_super_secret_jwt_key_2026_exhibition_prototype',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubAffiliation: user.clubAffiliation,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      clubAffiliation: req.user.clubAffiliation,
      department: req.user.department
    }
  });
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful.' });
});

module.exports = router;
