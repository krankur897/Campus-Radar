const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { verifyToken } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// @route   GET /api/announcements
// @desc    Get all announcements with filters
router.get('/', async (req, res) => {
  try {
    const { badge, source, q } = req.query;
    const query = {};

    if (badge && badge !== 'All') {
      query.badge = badge;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { source: searchRegex }
      ];
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json({ count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements.', error: error.message });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement.', error: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create announcement (Faculty, Admin)
router.post('/', verifyToken, authorizeRoles('Faculty', 'Admin'), async (req, res) => {
  try {
    const { title, content, source, badge, deadline, sourceUrl } = req.body;

    if (!title || !content || !source) {
      return res.status(400).json({ message: 'Please provide title, content, and source department.' });
    }

    const announcement = new Announcement({
      title,
      content,
      source,
      badge: badge || 'GENERAL',
      deadline: deadline || '',
      sourceUrl: sourceUrl || '',
      createdBy: req.user._id
    });

    await announcement.save();
    res.status(201).json({ message: 'Announcement published successfully.', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement.', error: error.message });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement (Faculty, Admin)
router.put('/:id', verifyToken, authorizeRoles('Faculty', 'Admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    Object.assign(announcement, req.body);
    await announcement.save();
    res.json({ message: 'Announcement updated successfully.', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement.', error: error.message });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (Faculty, Admin)
router.delete('/:id', verifyToken, authorizeRoles('Faculty', 'Admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement.', error: error.message });
  }
});

module.exports = router;
