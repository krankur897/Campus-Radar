const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// @route   GET /api/clubs
// @desc    Get all clubs with active event counts
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { presidentName: searchRegex }
      ];
    }

    const clubs = await Club.find(query).sort({ name: 1 });

    // Aggregate active event count for each club
    const todayStr = new Date().toISOString().split('T')[0];
    const clubsWithCounts = await Promise.all(clubs.map(async (club) => {
      const activeEventCount = await Event.countDocuments({
        $or: [
          { clubAffiliation: club.name },
          { organizer: club.name }
        ],
        status: 'Published',
        date: { $gte: todayStr }
      });

      return {
        ...club.toObject(),
        activeEventCount
      };
    }));

    res.json({ count: clubsWithCounts.length, clubs: clubsWithCounts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs.', error: error.message });
  }
});

// @route   GET /api/clubs/:id
// @desc    Get single club details with active events
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const activeEvents = await Event.find({
      $or: [
        { clubAffiliation: club.name },
        { organizer: club.name }
      ],
      status: 'Published',
      date: { $gte: todayStr }
    }).sort({ date: 1 });

    res.json({
      club,
      activeEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching club details.', error: error.message });
  }
});

// @route   POST /api/clubs
// @desc    Create new club (Admin only)
router.post('/', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { name, category, presidentName, facultyInCharge, description, contactEmail, logoUrl, socialLinks } = req.body;

    if (!name || !presidentName || !facultyInCharge || !description || !contactEmail) {
      return res.status(400).json({ message: 'Please fill in all required club details.' });
    }

    const club = new Club({
      name,
      category: category || 'Technical',
      presidentName,
      facultyInCharge,
      description,
      contactEmail,
      logoUrl: logoUrl || '',
      socialLinks: socialLinks || {}
    });

    await club.save();
    res.status(201).json({ message: 'Club registered successfully.', club });
  } catch (error) {
    res.status(500).json({ message: 'Error creating club.', error: error.message });
  }
});

// @route   PUT /api/clubs/:id
// @desc    Update club details (Admin, ClubPresident for own club)
router.put('/:id', verifyToken, authorizeRoles('ClubPresident', 'Admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    if (req.user.role === 'ClubPresident' && club.name !== req.user.clubAffiliation) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your affiliated club details.' });
    }

    Object.assign(club, req.body);
    await club.save();
    res.json({ message: 'Club details updated successfully.', club });
  } catch (error) {
    res.status(500).json({ message: 'Error updating club.', error: error.message });
  }
});

// @route   DELETE /api/clubs/:id
// @desc    Delete club (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: 'Club deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting club.', error: error.message });
  }
});

module.exports = router;
