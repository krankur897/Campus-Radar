const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-Time', 'Internship', 'FTE + Internship'],
    default: 'Full-Time'
  },
  eligibleBranches: [{
    type: String
  }],
  eligibleYear: {
    type: String,
    default: '2026 Passouts'
  },
  minCGPA: {
    type: Number,
    default: 6.0
  },
  backlogRule: {
    type: String,
    default: 'No active backlogs allowed'
  },
  location: {
    type: String,
    default: 'Flexible / Hybrid'
  },
  compensation: {
    type: String, // e.g. "18 LPA" or "₹45,000/month"
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  driveDate: {
    type: String,
    required: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  selectionProcess: {
    type: String,
    default: '1. Online Assessment -> 2. Technical Interview -> 3. HR Round'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Placement', placementSchema);
