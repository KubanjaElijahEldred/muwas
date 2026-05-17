const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1200,
    },
    source: {
      type: String,
      default: 'checkout',
      trim: true,
      maxlength: 80,
    },
    sourceLabel: {
      type: String,
      default: '',
      trim: true,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
