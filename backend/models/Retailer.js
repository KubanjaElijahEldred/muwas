const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    city: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: String,
    person: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  commissionRate: {
    type: Number,
    default: 10
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Retailer', retailerSchema);
