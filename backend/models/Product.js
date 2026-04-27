const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  wholesalePrice: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    alt: String
  }],
  category: {
    type: String,
    enum: ['gin', 'vodka', 'rum', 'whiskey', 'liqueur', 'other'],
    required: true
  },
  abv: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  ingredients: [String],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tastingNotes: [String],
  origin: {
    distillery: { type: String, default: 'Muwas Distilling' },
    location: { type: String, default: 'Uganda' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
