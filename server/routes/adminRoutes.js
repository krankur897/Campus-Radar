const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Placement = require('../models/Placement');
const Announcement = require('../models/Announcement');
const Club = require('../models/Club');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// All routes here require Admin authorization
router.use(verifyToken, authorizeRoles('Admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard summary statistics
router.get('/stats', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [activeEvents, totalEvents, placements, announcements, clubs, pendingApprovals] = await Promise.all([
      Event.countDocuments({ status: 'Published', date: { $gte: todayStr } }),
      Event.countDocuments({}),
      Placement.countDocuments({}),
      Announcement.countDocuments({}),
      Club.countDocuments({}),
      Event.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      activeEvents,
      totalEvents,
      placements,
      announcements,
      clubs,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin stats.', error: error.message });
  }
});

// @route   GET /api/admin/pending
// @desc    Get all pending content submissions and highlight requests
router.get('/pending', async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: 'Pending' }).populate('createdBy', 'name email role');
    const highlightRequests = await Event.find({ highlightStatus: 'Requested' }).populate('createdBy', 'name email role');

    res.json({
      pendingEvents,
      highlightRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading pending moderation items.', error: error.message });
  }
});

// @route   PUT /api/admin/content/:id/approve
// @desc    Approve a pending event
router.put('/content/:id/approve', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    event.status = 'Published';
    if (event.highlightStatus === 'Requested') {
      event.highlightStatus = 'Approved';
      event.isHighlight = true;
    }

    await event.save();
    res.json({ message: `Event '${event.title}' has been approved and published!`, event });
  } catch (error) {
    res.status(500).json({ message: 'Error approving event.', error: error.message });
  }
});

// @route   PUT /api/admin/content/:id/reject
// @desc    Reject a pending event
router.put('/content/:id/reject', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    event.status = 'Rejected';
    await event.save();
    res.json({ message: `Event '${event.title}' was rejected.`, event });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting event.', error: error.message });
  }
});

// @route   PUT /api/admin/events/:id/toggle-highlight
// @desc    Toggle Campus Highlight status for an event
router.put('/events/:id/toggle-highlight', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    event.isHighlight = !event.isHighlight;
    event.highlightStatus = event.isHighlight ? 'Approved' : 'None';
    await event.save();

    res.json({
      message: `Campus Highlight ${event.isHighlight ? 'enabled' : 'disabled'} for '${event.title}'.`,
      isHighlight: event.isHighlight
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling highlight status.', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get user list
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
});

module.exports = router;
