const express = require('express');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize('wholesale', 'admin'), async (req, res) => {
  try {
    const { category, limit, page = 1, includePagination = 'true' } = req.query;
    const filter = { 
      isActive: true,
      wholesalePrice: { $exists: true, $gt: 0 }
    };
    
    if (category) filter.category = category;

    const limitNum = limit ? parseInt(limit, 10) : 60;
    const skip = (page - 1) * limitNum;

    const productsQuery = Product.find(filter)
      .select('name description shortDescription price wholesalePrice images category abv volume stock')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const shouldIncludePagination =
      String(includePagination).toLowerCase() !== 'false' &&
      String(includePagination).toLowerCase() !== '0';

    if (!shouldIncludePagination) {
      const products = await productsQuery;
      return res.json({ products });
    }

    const [products, total] = await Promise.all([
      productsQuery,
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get wholesale products error:', error);
    res.status(500).json({ message: 'Server error fetching wholesale products' });
  }
});

router.post('/order', auth, authorize('wholesale', 'admin'), async (req, res) => {
  try {
    const { products, shippingAddress, deliveryMethod, paymentMethod, notes } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || !product.wholesalePrice) {
        return res.status(400).json({ message: `Product ${item.productId} not available for wholesale` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.wholesalePrice
      });

      totalAmount += product.wholesalePrice * item.quantity;
    }

    const deliveryFee = deliveryMethod === 'boda_delivery' ? 3000 : 0;
    totalAmount += deliveryFee;

    const Order = require('../models/Order');
    const order = new Order({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      deliveryFee,
      notes
    });

    await order.save();

    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: 'Wholesale order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create wholesale order error:', error);
    res.status(500).json({ message: 'Server error creating wholesale order' });
  }
});

module.exports = router;
