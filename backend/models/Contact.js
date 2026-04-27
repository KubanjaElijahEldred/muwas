const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    requestType: {
      type: String,
      enum: ['contact', 'tour'],
      default: 'contact',
    },
    tourType: {
      type: String,
      trim: true,
      default: '',
    },
    tourDate: {
      type: String,
      trim: true,
      default: '',
    },
    tourTime: {
      type: String,
      trim: true,
      default: '',
    },
    numberOfGuests: {
      type: Number,
      min: 1,
      max: 50,
      default: 1,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);
