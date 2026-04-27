const mongoose = require('mongoose');

const generateOrderNumber = () => {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');

  return `MW-${timestampPart}-${randomPart}`;
};

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: generateOrderNumber
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'bank_transfer', 'cash_on_delivery', 'credit_card'],
    required: true
  },
  paymentProvider: String,
  paymentReferenceId: String,
  paymentExternalId: String,
  paymentFinancialTransactionId: String,
  paymentPhoneNumber: String,
  paymentProviderStatus: String,
  paymentFailureReason: String,
  paymentInitiatedAt: Date,
  paymentCompletedAt: Date,
  paymentLastCheckedAt: Date,
  shippingAddress: {
    street: String,
    city: String,
    country: { type: String, default: 'Uganda' },
    postalCode: String,
    phone: String
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'boda_delivery', 'retailer_delivery'],
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  },
  trackingNumber: String,
  inventoryReleasedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  shippedAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

orderSchema.pre('validate', function() {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
});

module.exports = mongoose.model('Order', orderSchema);
