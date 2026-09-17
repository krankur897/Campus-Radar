const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String, // Department / Cell name e.g. "Academic Cell", "Exam Cell", "VTOP", "Hostel", "Placement Cell"
    required: true
  },
  badge: {
    type: String,
    enum: ['URGENT', 'DEADLINE', 'ACADEMIC', 'EXAM', 'HOSTEL', 'GENERAL'],
    default: 'GENERAL'
  },
  postedAt: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  deadline: {
    type: String,
    default: ''
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
