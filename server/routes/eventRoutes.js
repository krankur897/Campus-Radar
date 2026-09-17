const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken, optionalToken } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// @route   GET /api/events
// @desc    Get all events with search, category, range, and past filters
router.get('/', optionalToken, async (req, res) => {
  try {
    const { category, range, q, past, highlight, status } = req.query;
    const query = {};

    // By default, public reads only Published events unless status explicitly requested by authorized user
    if (status) {
      query.status = status;
    } else if (!req.user || req.user.role === 'Student') {
      query.status = 'Published';
    }

    if (category && category !== 'All') {
      query.categories = category;
    }

    if (highlight === 'true') {
      query.isHighlight = true;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { organizer: searchRegex },
        { categories: searchRegex }
      ];
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (past === 'true') {
      // Past events
      query.date = { $lt: todayStr };
    } else if (past === 'false' || !past) {
      // Upcoming events (date >= today)
      query.date = { $gte: todayStr };
    }

    // Time range filter for upcoming events
    if (range && range !== 'all') {
      const now = new Date();
      if (range === 'week') {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        query.date = { $gte: todayStr, $lte: nextWeekStr };
      } else if (range === 'month') {
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        query.date = { $gte: todayStr, $lte: nextMonthStr };
      }
    }

    // Sort: Highlights first, then soonest date
    const events = await Event.find(query).sort({ isHighlight: -1, date: 1 });
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events.', error: error.message });
  }
});

// @route   GET /api/events/search
// @desc    Quick search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ events: [] });
    const searchRegex = new RegExp(q, 'i');
    const events = await Event.find({
      status: 'Published',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { organizer: searchRegex }
      ]
    }).limit(10);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error searching events.', error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving event details.', error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create an event (ClubPresident, Admin)
router.post('/', verifyToken, authorizeRoles('ClubPresident', 'Admin'), async (req, res) => {
  try {
    const {
      title, categories, description, date, startTime, endTime,
      venue, organizer, clubAffiliation, clubType, registrationDeadline,
      registrationUrl, posterUrl, eligibility, rules, contact, requestHighlight
    } = req.body;

    if (!title || !description || !date || !venue || !organizer || !registrationUrl) {
      return res.status(400).json({ message: 'Please fill in all required fields (title, description, date, venue, organizer, registration URL).' });
    }

    // If submitted by Admin -> Published directly. If ClubPresident -> Pending moderation
    const status = req.user.role === 'Admin' ? 'Published' : 'Pending';
    const isHighlight = req.user.role === 'Admin' && requestHighlight === true;
    const highlightStatus = requestHighlight ? (req.user.role === 'Admin' ? 'Approved' : 'Requested') : 'None';

    const event = new Event({
      title,
      categories: Array.isArray(categories) ? categories : [categories || 'Technical'],
      description,
      date,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '05:00 PM',
      venue,
      organizer,
      clubAffiliation: clubAffiliation || req.user.clubAffiliation || organizer,
      clubType: clubType || 'Technical',
      registrationDeadline: registrationDeadline || date,
      registrationUrl,
      posterUrl: posterUrl || '',
      eligibility: eligibility || 'Open to all college students',
      rules: rules || 'Standard campus event guidelines apply.',
      contact: contact || req.user.email,
      isHighlight,
      highlightStatus,
      status,
      createdBy: req.user._id
    });

    await event.save();
    res.status(201).json({
      message: status === 'Published' ? 'Event created & published successfully.' : 'Event submitted for admin approval.',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event.', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event.', error: error.message });
  }
});

router.put('/:id', verifyToken, authorizeRoles('ClubPresident', 'Admin'), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // ClubPresident can only update their own created events or events for their club
    if (req.user.role === 'ClubPresident' && event.createdBy.toString() !== req.user._id.toString() && event.clubAffiliation !== req.user.clubAffiliation) {
      return res.status(403).json({ message: 'Unauthorized. You can only edit your own club events.' });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ message: 'Event updated successfully.', event });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event.', error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
router.delete('/:id', verifyToken, authorizeRoles('ClubPresident', 'Admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (req.user.role === 'ClubPresident' && event.createdBy.toString() !== req.user._id.toString() && event.clubAffiliation !== req.user.clubAffiliation) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own club events.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event.', error: error.message });
  }
});

module.exports = router;
