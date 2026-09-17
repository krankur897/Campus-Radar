const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Literature', 'Social'],
    default: 'Technical'
  },
  presidentName: {
    type: String,
    required: true
  },
  facultyInCharge: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  socialLinks: {
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
