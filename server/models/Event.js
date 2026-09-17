const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  categories: [{
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Hackathon', 'Seminar', 'Competition', 'Club Event']
  }],
  description: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD or readable string
    required: true
  },
  startTime: {
    type: String,
    default: '10:00 AM'
  },
  endTime: {
    type: String,
    default: '05:00 PM'
  },
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  clubAffiliation: {
    type: String,
    default: ''
  },
  clubType: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'General'],
    default: 'Technical'
  },
  registrationDeadline: {
    type: String,
    required: true
  },
  registrationUrl: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    default: ''
  },
  eligibility: {
    type: String,
    default: 'Open for all college students'
  },
  rules: {
    type: String,
    default: 'Standard campus conduct rules apply.'
  },
  contact: {
    type: String,
    default: 'events@campusradar.edu'
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  highlightStatus: {
    type: String,
    enum: ['None', 'Requested', 'Approved'],
    default: 'None'
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Published'],
    default: 'Published'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
