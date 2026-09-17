const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement');
const { verifyToken } = require('../middleware/auth');
const authorizeRoles = require('../middleware/role');

// @route   GET /api/placements
// @desc    Get all placement & internship opportunities with filters
router.get('/', async (req, res) => {
  try {
    const { type, branch, minCGPA, q } = req.query;
    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (branch && branch !== 'All') {
      query.eligibleBranches = { $in: [branch, 'All Branches', 'CSE', 'ECE', 'MECH', 'EEE'] };
    }

    if (minCGPA) {
      const cgpaVal = parseFloat(minCGPA);
      if (!isNaN(cgpaVal)) {
        query.minCGPA = { $lte: cgpaVal };
      }
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { company: searchRegex },
        { role: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    const placements = await Placement.find(query).sort({ createdAt: -1 });
    res.json({ count: placements.length, placements });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement opportunities.', error: error.message });
  }
});

// @route   GET /api/placements/:id
// @desc    Get single placement by ID
router.get('/:id', async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement opportunity not found.' });
    }
    res.json(placement);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving placement details.', error: error.message });
  }
});

// @route   POST /api/placements
// @desc    Create a placement opportunity (PlacementHead, Admin)
router.post('/', verifyToken, authorizeRoles('PlacementHead', 'Admin'), async (req, res) => {
  try {
    const {
      company, role, type, eligibleBranches, eligibleYear, minCGPA,
      backlogRule, location, compensation, deadline, driveDate,
      applicationUrl, description, selectionProcess
    } = req.body;

    if (!company || !role || !compensation || !deadline || !applicationUrl || !description) {
      return res.status(400).json({ message: 'Please fill in all required placement details.' });
    }

    const placement = new Placement({
      company,
      role,
      type: type || 'Full-Time',
      eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches : ['All Branches'],
      eligibleYear: eligibleYear || '2026 Batch',
      minCGPA: minCGPA ? parseFloat(minCGPA) : 6.0,
      backlogRule: backlogRule || 'No active backlogs',
      location: location || 'Flexible',
      compensation,
      deadline,
      driveDate: driveDate || deadline,
      applicationUrl,
      description,
      selectionProcess: selectionProcess || 'Online Test -> Technical Interview -> HR Interview',
      createdBy: req.user._id
    });

    await placement.save();
    res.status(201).json({ message: 'Placement opportunity published successfully.', placement });
  } catch (error) {
    res.status(500).json({ message: 'Error creating placement opportunity.', error: error.message });
  }
});

// @route   PUT /api/placements/:id
// @desc    Update placement opportunity (PlacementHead, Admin)
router.put('/:id', verifyToken, authorizeRoles('PlacementHead', 'Admin'), async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement opportunity not found.' });
    }

    Object.assign(placement, req.body);
    await placement.save();
    res.json({ message: 'Placement opportunity updated successfully.', placement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating placement opportunity.', error: error.message });
  }
});

// @route   DELETE /api/placements/:id
// @desc    Delete placement opportunity (PlacementHead, Admin)
router.delete('/:id', verifyToken, authorizeRoles('PlacementHead', 'Admin'), async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement opportunity not found.' });
    }

    await Placement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Placement opportunity deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting placement opportunity.', error: error.message });
  }
});

module.exports = router;
