const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');
const {
  getFallbackProductById,
  updateFallbackProductById,
} = require('../services/fallbackCatalogStore');
const {
  assertConfigured: assertMtnConfigured,
  getRequestToPayStatus: getMtnPaymentStatus,
  normalizePaymentStatus: normalizeMtnPaymentStatus,
  normalizePhoneNumber: normalizeMtnPhoneNumber,
  requestToPay: requestMtnPayment,
} = require('../services/mtnMomo');
const {
  assertConfigured: assertAirtelConfigured,
  getPaymentStatus: getAirtelPaymentStatus,
  normalizePaymentStatus: normalizeAirtelPaymentStatus,
  normalizePhoneNumber: normalizeAirtelPhoneNumber,
  requestToPay: requestAirtelPayment,
} = require('../services/airtelMoney');
const { createAdminNotification } = require('../services/notifications');

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createPaymentReferenceId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Support older Node.js runtimes where randomUUID is unavailable.
  const hex = crypto.randomBytes(16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const mobileMoneyProviders = {
  mtn: {
    key: 'mtn',
    providerCode: 'mtn_momo',
    label: 'MTN Mobile Money',
    assertConfigured: assertMtnConfigured,
    normalizePhoneNumber: normalizeMtnPhoneNumber,
    requestPayment: async ({ amount, phoneNumber, order }) => requestMtnPayment({
      amount,
      phoneNumber,
      externalId: order.orderNumber,
      referenceId: order.paymentReferenceId,
      payerMessage: `Muwas order ${order.orderNumber}`,
      payeeNote: 'Muwas Distilling checkout',
    }),
    getPaymentStatus: async (referenceId) => getMtnPaymentStatus(referenceId),
    normalizePaymentStatus: normalizeMtnPaymentStatus,
  },
  airtel: {
    key: 'airtel',
    providerCode: 'airtel_money',
    label: 'Airtel Money',
    assertConfigured: assertAirtelConfigured,
    normalizePhoneNumber: normalizeAirtelPhoneNumber,
    requestPayment: async ({ amount, phoneNumber, order }) => requestAirtelPayment({
      amount,
      phoneNumber,
      externalId: order.orderNumber,
      referenceId: order.paymentReferenceId,
    }),
    getPaymentStatus: async (referenceId) => getAirtelPaymentStatus(referenceId),
    normalizePaymentStatus: normalizeAirtelPaymentStatus,
  },
};

const providerCodeToKey = Object.fromEntries(
  Object.values(mobileMoneyProviders).map((provider) => [provider.providerCode, provider.key])
);

const getMobileMoneyProvider = (providerKeyOrCode = 'mtn') => {
  if (mobileMoneyProviders[providerKeyOrCode]) {
    return mobileMoneyProviders[providerKeyOrCode];
  }

  const providerKey = providerCodeToKey[providerKeyOrCode];

  if (providerKey && mobileMoneyProviders[providerKey]) {
    return mobileMoneyProviders[providerKey];
  }

  return mobileMoneyProviders.mtn;
};

const transientNetworkErrorCodes = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
]);

const normalizePaymentProviderError = (error, provider) => {
  if (error?.statusCode) {
    return error;
  }

  const rawMessage = String(error?.message || '');
  const isNetworkLikeError =
    error?.name === 'TypeError' ||
    transientNetworkErrorCodes.has(error?.code) ||
    /fetch failed|network|timed out|timeout|socket/i.test(rawMessage);

  const statusCode = isNetworkLikeError ? 503 : 502;
  const message = isNetworkLikeError
    ? `${provider.label} is temporarily unavailable. Please try again in a moment or use another payment method.`
    : rawMessage || `${provider.label} payment request failed.`;

  const normalizedError = createHttpError(message, statusCode);
  normalizedError.cause = error;
  return normalizedError;
};

const getAccessibleOrder = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('products.productId', 'name images')
    .populate('userId', 'name email');

  if (!order) {
    return null;
  }

  const orderOwnerId = order.userId?._id
    ? order.userId._id.toString()
    : order.userId
      ? order.userId.toString()
      : '';

  if (user.role !== 'admin' && orderOwnerId !== user._id.toString()) {
    return 'forbidden';
  }

  return order;
};

const getOrderProductId = (productId) => {
  if (productId && typeof productId === 'object' && productId._id) {
    return productId._id;
  }

  return productId;
};

const buildOrderProducts = async (products, userRole) => {
  let totalAmount = 0;
  const orderProducts = [];

  for (const item of products) {
    if (!item || typeof item !== 'object') {
      throw createHttpError('One of the selected products is invalid. Please refresh the cart and try again.');
    }

    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw createHttpError('One of the selected products is no longer valid. Please refresh the catalog and add it again.');
    }

    const quantity = Number.parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError('Each product quantity must be a whole number greater than zero.');
    }

    const product = await Product.findById(item.productId);

    if (!product || !product.isActive) {
      throw createHttpError(`Product ${item.productId} not found`);
    }

    if (product.stock < quantity) {
      throw createHttpError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`
      );
    }

    const price = userRole === 'wholesale' && product.wholesalePrice
      ? product.wholesalePrice
      : product.price;

    orderProducts.push({
      productId: product._id,
      quantity,
      price,
    });

    totalAmount += price * quantity;
  }

  return { orderProducts, totalAmount };
};

const reserveInventory = async (products) => {
  for (const item of products) {
    await Product.findByIdAndUpdate(getOrderProductId(item.productId), {
      $inc: { stock: -item.quantity },
    });
  }
};

const releaseInventory = async (order) => {
  if (order.inventoryReleasedAt) {
    return;
  }

  for (const item of order.products) {
    await Product.findByIdAndUpdate(getOrderProductId(item.productId), {
      $inc: { stock: item.quantity },
    });
  }

  order.inventoryReleasedAt = new Date();
};

const fallbackOrders = [];

const cloneFallbackValue = (value) => JSON.parse(JSON.stringify(value));

const createFallbackOrderId = () =>
  `fallback-order-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const createFallbackOrderNumber = () => {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `MW-FB-${timestampPart}-${randomPart}`;
};

const getFallbackOrderOwnerId = (order) => {
  if (order?.userId && typeof order.userId === 'object' && order.userId._id) {
    return String(order.userId._id);
  }

  return String(order?.userId || '');
};

const canAccessFallbackOrder = (order, user) =>
  user.role === 'admin' || getFallbackOrderOwnerId(order) === String(user._id);

const getFallbackOrderById = (orderId) =>
  fallbackOrders.find((order) => String(order._id) === String(orderId)) || null;

const reserveFallbackInventory = (reservations = []) => {
  reservations.forEach((reservation) => {
    updateFallbackProductById(reservation.productId, (currentProduct) => ({
      ...currentProduct,
      stock: Math.max(0, Number(currentProduct.stock || 0) - reservation.quantity),
      updatedAt: new Date().toISOString(),
    }));
  });
};

const releaseFallbackInventory = (order) => {
  if (order.inventoryReleasedAt) {
    return;
  }

  order.products.forEach((item) => {
    const productId = item.productRefId || item.productId?._id || item.productId;
    const quantity = Number(item.quantity || 0);

    if (!productId || quantity <= 0) {
      return;
    }

    updateFallbackProductById(productId, (currentProduct) => ({
      ...currentProduct,
      stock: Number(currentProduct.stock || 0) + quantity,
      updatedAt: new Date().toISOString(),
    }));
  });

  order.inventoryReleasedAt = new Date().toISOString();
};

const buildFallbackOrderProducts = (products, userRole) => {
  let totalAmount = 0;
  const orderProducts = [];
  const reservations = [];

  for (const item of products) {
    if (!item || typeof item !== 'object') {
      throw createHttpError(
        'One of the selected products is invalid. Please refresh the cart and try again.'
      );
    }

    const productId = String(item.productId || '').trim();

    if (!productId) {
      throw createHttpError(
        'One of the selected products is missing an id. Please refresh the catalog.'
      );
    }

    const quantity = Number.parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError('Each product quantity must be a whole number greater than zero.');
    }

    const product = getFallbackProductById(productId);

    if (!product || product.isActive === false) {
      throw createHttpError(`Product ${productId} not found`);
    }

    if (Number(product.stock || 0) < quantity) {
      throw createHttpError(
        `Insufficient stock for ${product.name}. Available: ${Number(product.stock || 0)}`
      );
    }

    const price =
      userRole === 'wholesale' && Number.isFinite(product.wholesalePrice)
        ? product.wholesalePrice
        : product.price;

    orderProducts.push({
      productId: {
        _id: product._id,
        name: product.name,
        images: product.images || [],
      },
      productRefId: product._id,
      quantity,
      price,
    });

    reservations.push({
      productId: product._id,
      quantity,
    });

    totalAmount += price * quantity;
  }

  return { orderProducts, totalAmount, reservations };
};

const buildPaymentResponse = (order, overrides = {}) => {
  const provider = getMobileMoneyProvider(order.paymentProvider);
  const providerLabel = provider.label;

  return {
    requiresAction: order.paymentMethod === 'mobile_money' && order.paymentStatus === 'pending',
    channel: order.paymentProvider || order.paymentMethod,
    provider: provider.key,
    providerLabel,
    referenceId: order.paymentReferenceId || '',
    phoneNumber: order.paymentPhoneNumber || '',
    status: order.paymentStatus,
    providerStatus: order.paymentProviderStatus || '',
    message:
      overrides.message ||
      (order.paymentStatus === 'paid'
        ? `${providerLabel} payment confirmed.`
        : order.paymentStatus === 'failed'
          ? order.paymentFailureReason || `${providerLabel} payment failed.`
          : `Check your phone for the ${providerLabel} confirmation prompt and enter your PIN there.`),
    instructions:
      overrides.instructions ||
      (order.paymentStatus === 'pending'
        ? `Confirm the ${providerLabel} request on the phone. The PIN is entered on the handset, not on this website.`
        : ''),
  };
};

const syncMobileMoneyOrder = async (order, statusPayload) => {
  const provider = getMobileMoneyProvider(order.paymentProvider);
  const paymentState = provider.normalizePaymentStatus(statusPayload);

  order.paymentProvider = provider.providerCode;
  order.paymentProviderStatus = paymentState.rawStatus;
  order.paymentLastCheckedAt = new Date();

  if (paymentState.externalId) {
    order.paymentExternalId = paymentState.externalId;
  }

  if (paymentState.financialTransactionId) {
    order.paymentFinancialTransactionId = paymentState.financialTransactionId;
  }

  if (paymentState.reason) {
    order.paymentFailureReason = paymentState.reason;
  }

  if (paymentState.paymentStatus === 'paid') {
    order.paymentStatus = 'paid';
    order.paymentFailureReason = '';
    order.paymentCompletedAt = order.paymentCompletedAt || new Date();
  }

  if (paymentState.paymentStatus === 'failed') {
    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.paymentCompletedAt = order.paymentCompletedAt || new Date();
    await releaseInventory(order);
  }

  await order.save();
  return order;
};

const handleMobileMoneyCallback = async (req, res) => {
  try {
    const provider = getMobileMoneyProvider(req.params.provider || 'mtn');
    const order = await Order.findOne({ paymentReferenceId: req.params.referenceId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentProvider !== provider.providerCode) {
      return res.status(400).json({ message: 'Payment provider mismatch' });
    }

    const payload = Object.keys(req.body || {}).length > 0
      ? req.body
      : await provider.getPaymentStatus(order.paymentReferenceId);

    await syncMobileMoneyOrder(order, payload);

    res.json({ message: 'Callback received' });
  } catch (error) {
    console.error('Mobile money callback error:', error);
    res.status(500).json({ message: 'Server error processing payment callback' });
  }
};

router.post('/mobile-money/callback/:provider/:referenceId', handleMobileMoneyCallback);
router.put('/mobile-money/callback/:provider/:referenceId', handleMobileMoneyCallback);
router.post('/mobile-money/callback/:referenceId', (req, res) => {
  req.params.provider = 'mtn';
  return handleMobileMoneyCallback(req, res);
});
router.put('/mobile-money/callback/:referenceId', (req, res) => {
  req.params.provider = 'mtn';
  return handleMobileMoneyCallback(req, res);
});

router.post('/', auth, async (req, res) => {
  let order = null;
  let inventoryReserved = false;

  try {
    const {
      products,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      notes,
      mobileMoney,
    } = req.body;
    const allowedDeliveryMethods = ['pickup', 'boda_delivery', 'retailer_delivery'];
    const allowedPaymentMethods = ['mobile_money', 'bank_transfer', 'cash_on_delivery', 'credit_card'];

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

    if (!allowedDeliveryMethods.includes(deliveryMethod)) {
      return res.status(400).json({
        message: `Delivery method must be one of: ${allowedDeliveryMethods.join(', ')}`,
      });
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: `Payment method must be one of: ${allowedPaymentMethods.join(', ')}`,
      });
    }

    if (!isDatabaseReady()) {
      let selectedProvider = null;
      let normalizedPaymentPhone = '';

      if (paymentMethod === 'mobile_money') {
        selectedProvider = getMobileMoneyProvider(mobileMoney?.provider || 'mtn');

        try {
          normalizedPaymentPhone = selectedProvider.normalizePhoneNumber(
            mobileMoney?.phoneNumber || shippingAddress?.phone
          );
        } catch (phoneError) {
          normalizedPaymentPhone = String(
            mobileMoney?.phoneNumber || shippingAddress?.phone || ''
          ).trim();
        }
      }

      const {
        orderProducts: fallbackOrderProducts,
        totalAmount: fallbackProductTotal,
        reservations,
      } = buildFallbackOrderProducts(products, req.user.role);
      const deliveryFee = deliveryMethod === 'boda_delivery' ? 5000 : 0;
      const totalAmount = fallbackProductTotal + deliveryFee;
      const nowIso = new Date().toISOString();
      const fallbackOrder = {
        _id: createFallbackOrderId(),
        orderNumber: createFallbackOrderNumber(),
        userId: {
          _id: req.user._id,
          name: req.user.name || '',
          email: req.user.email || '',
        },
        products: fallbackOrderProducts,
        totalAmount,
        shippingAddress,
        deliveryMethod,
        paymentMethod,
        paymentProvider: selectedProvider ? selectedProvider.providerCode : '',
        paymentPhoneNumber: normalizedPaymentPhone,
        paymentReferenceId: paymentMethod === 'mobile_money' ? createPaymentReferenceId() : '',
        paymentExternalId: paymentMethod === 'mobile_money' ? '' : '',
        paymentProviderStatus: paymentMethod === 'mobile_money' ? 'SUCCESSFUL' : '',
        paymentStatus:
          paymentMethod === 'mobile_money'
            ? 'paid'
            : paymentMethod === 'cash_on_delivery'
              ? 'pending'
              : 'pending',
        paymentCompletedAt: paymentMethod === 'mobile_money' ? nowIso : null,
        deliveryFee,
        notes,
        status: 'pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      reserveFallbackInventory(reservations);
      fallbackOrders.unshift(fallbackOrder);

      if (paymentMethod === 'mobile_money') {
        const responseMessage = `${selectedProvider?.label || 'Mobile money'} payment captured in fallback mode.`;

        return res.status(201).json({
          message: responseMessage,
          order: cloneFallbackValue(fallbackOrder),
          payment: buildPaymentResponse(fallbackOrder, {
            message: responseMessage,
            instructions:
              'Fallback mode confirmed payment locally. Connect database and provider APIs for full live processing.',
          }),
          source: 'fallback',
        });
      }

      return res.status(201).json({
        message: 'Order placed successfully',
        order: cloneFallbackValue(fallbackOrder),
        source: 'fallback',
      });
    }

    let selectedProvider = null;
    let normalizedPaymentPhone = '';

    if (paymentMethod === 'mobile_money') {
      selectedProvider = getMobileMoneyProvider(mobileMoney?.provider || 'mtn');
      selectedProvider.assertConfigured();
      normalizedPaymentPhone = selectedProvider.normalizePhoneNumber(
        mobileMoney?.phoneNumber || shippingAddress?.phone
      );
    }

    const { orderProducts, totalAmount: productTotal } = await buildOrderProducts(
      products,
      req.user.role
    );

    const deliveryFee = deliveryMethod === 'boda_delivery' ? 5000 : 0;
    const totalAmount = productTotal + deliveryFee;

    order = new Order({
      userId: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      paymentProvider: selectedProvider ? selectedProvider.providerCode : '',
      paymentPhoneNumber: normalizedPaymentPhone,
      paymentReferenceId: paymentMethod === 'mobile_money' ? createPaymentReferenceId() : '',
      paymentExternalId: paymentMethod === 'mobile_money' ? '' : '',
      deliveryFee,
      notes,
    });

    await order.save();
    await reserveInventory(orderProducts);
    inventoryReserved = true;

    await createAdminNotification({
      title: 'New Order Placed',
      message: `${order.orderNumber} has been created and needs confirmation.`,
      type: 'info',
      metadata: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      },
    });

    if (selectedProvider) {
      let responseStatus = 201;
      let responseMessage = `${selectedProvider.label} prompt sent. Check the customer phone to approve the payment.`;

      try {
        const paymentRequest = await selectedProvider.requestPayment({
          amount: totalAmount,
          phoneNumber: normalizedPaymentPhone,
          order,
        });

        if (paymentRequest.referenceId) {
          order.paymentReferenceId = paymentRequest.referenceId;
        }

        if (paymentRequest.phoneNumber) {
          order.paymentPhoneNumber = paymentRequest.phoneNumber;
        }

        order.paymentProviderStatus = 'PENDING';
        order.paymentInitiatedAt = new Date();
        order.paymentExternalId = order.orderNumber;
        await order.save();
      } catch (paymentError) {
        const normalizedPaymentError = normalizePaymentProviderError(paymentError, selectedProvider);

        try {
          const statusPayload = await selectedProvider.getPaymentStatus(order.paymentReferenceId);
          await syncMobileMoneyOrder(order, statusPayload);

          if (order.paymentStatus === 'paid') {
            responseMessage = `${selectedProvider.label} payment confirmed.`;
          }
        } catch (statusError) {
          if (statusError.statusCode === 404) {
            order.paymentStatus = 'failed';
            order.status = 'cancelled';
            order.paymentFailureReason = normalizedPaymentError.message;
            await releaseInventory(order);
            await order.save();
            throw normalizedPaymentError;
          }

          order.paymentFailureReason = normalizedPaymentError.message;
          order.paymentLastCheckedAt = new Date();
          await order.save();

          responseStatus = 202;
          responseMessage =
            `${selectedProvider.label} may still be processing. Check the phone for a prompt, then use payment status to confirm.`;
        }
      }

      return res.status(responseStatus).json({
        message: responseMessage,
        order,
        payment: buildPaymentResponse(order, { message: responseMessage }),
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    if (order && inventoryReserved && !order.inventoryReleasedAt && order.paymentStatus !== 'paid') {
      try {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
        order.paymentFailureReason = order.paymentFailureReason || error.message;
        await releaseInventory(order);
        await order.save();
      } catch (releaseError) {
        console.error('Order rollback error:', releaseError);
      }
    }

    console.error('Create order error:', error);

    const isValidationError = error?.name === 'ValidationError' || error?.name === 'CastError';
    const statusCode = error.statusCode || (isValidationError ? 400 : 500);
    const message = isValidationError
      ? Object.values(error.errors || {})[0]?.message || 'Invalid order payload.'
      : error.message || 'Server error creating order';

    res.status(statusCode).json({ message });
  }
});

router.get('/my-orders', auth, async (req, res) => {
  try {
    console.log('Fetching my-orders for user:', req.user?._id);
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    if (!isDatabaseReady()) {
      let scopedOrders = fallbackOrders.filter(
        (order) => getFallbackOrderOwnerId(order) === String(req.user._id)
      );

      if (status) {
        scopedOrders = scopedOrders.filter((order) => order.status === status);
      }

      const sortedOrders = [...scopedOrders].sort(
        (firstOrder, secondOrder) =>
          new Date(secondOrder.createdAt).getTime() - new Date(firstOrder.createdAt).getTime()
      );

      return res.json({
        orders: sortedOrders.slice(skip, skip + limitNum).map((order) => cloneFallbackValue(order)),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: sortedOrders.length,
          pages: Math.ceil(sortedOrders.length / limitNum),
        },
        source: 'fallback',
      });
    }

    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('products.productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!isDatabaseReady()) {
      const order = getFallbackOrderById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!canAccessFallbackOrder(order, req.user)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Update order status in fallback
      order.status = status;
      order.updatedAt = new Date().toISOString();

      return res.json({
        message: 'Order status updated successfully',
        order: cloneFallbackValue(order),
        source: 'fallback'
      });
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    return res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Server error updating order status' });
  }
});

router.get('/:id/payment-status', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const order = getFallbackOrderById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!canAccessFallbackOrder(order, req.user)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({
        order: cloneFallbackValue(order),
        payment: buildPaymentResponse(order, {
          message:
            order.paymentMethod === 'mobile_money'
              ? 'Fallback mode confirms mobile money payments immediately.'
              : 'This order does not require mobile money confirmation.',
          instructions:
            order.paymentMethod === 'mobile_money'
              ? 'Connect live provider APIs for production-grade payment tracking.'
              : '',
        }),
        source: 'fallback',
      });
    }

    const order = await getAccessibleOrder(req.params.id, req.user);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order === 'forbidden') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentMethod !== 'mobile_money' || !order.paymentReferenceId) {
      return res.json({
        order,
        payment: buildPaymentResponse(order, {
          message: 'This order does not require mobile money confirmation.',
          instructions: '',
        }),
      });
    }

    if (order.paymentStatus === 'paid' || order.paymentStatus === 'failed') {
      return res.json({
        order,
        payment: buildPaymentResponse(order),
      });
    }

    const provider = getMobileMoneyProvider(order.paymentProvider);
    try {
      const statusPayload = await provider.getPaymentStatus(order.paymentReferenceId);
      await syncMobileMoneyOrder(order, statusPayload);
    } catch (providerError) {
      const providerMessage =
        providerError?.message || `${provider.label} status check is temporarily unavailable.`;

      // Do not hard-fail checkout polling for transient provider API issues.
      // Keep order pending and let the UI continue polling or allow manual refresh.
      order.paymentLastCheckedAt = new Date();
      if (!order.paymentFailureReason) {
        order.paymentFailureReason = providerMessage;
      }
      await order.save();

      return res.json({
        order,
        payment: buildPaymentResponse(order, {
          message: `${provider.label} status is temporarily unavailable. We will keep checking while your payment remains pending.`,
        }),
      });
    }

    res.json({
      order,
      payment: buildPaymentResponse(order),
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Server error fetching payment status',
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const order = getFallbackOrderById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!canAccessFallbackOrder(order, req.user)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json({ order: cloneFallbackValue(order), source: 'fallback' });
    }

    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name images')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderOwnerId = order.userId?._id
      ? order.userId._id.toString()
      : order.userId
        ? order.userId.toString()
        : '';

    if (req.user.role !== 'admin' && orderOwnerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Server error fetching order' });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    if (!isDatabaseReady()) {
      let scopedOrders = [...fallbackOrders];

      if (status) {
        scopedOrders = scopedOrders.filter((order) => order.status === status);
      }

      if (paymentStatus) {
        scopedOrders = scopedOrders.filter((order) => order.paymentStatus === paymentStatus);
      }

      const sortedOrders = scopedOrders.sort(
        (firstOrder, secondOrder) =>
          new Date(secondOrder.createdAt).getTime() - new Date(firstOrder.createdAt).getTime()
      );

      return res.json({
        orders: sortedOrders
          .slice(skip, skip + limitNum)
          .map((order) => cloneFallbackValue(order)),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: sortedOrders.length,
          pages: Math.ceil(sortedOrders.length / limitNum),
        },
        source: 'fallback',
      });
    }

    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('products.productId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    return res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ message: 'Server error fetching orders' });
  }
});

router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber } = req.body;

    if (!isDatabaseReady()) {
      const fallbackOrder = getFallbackOrderById(req.params.id);

      if (!fallbackOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (status) {
        fallbackOrder.status = status;
        if (status === 'shipped') fallbackOrder.shippedAt = new Date().toISOString();
        if (status === 'delivered') fallbackOrder.deliveredAt = new Date().toISOString();
      }

      if (paymentStatus) {
        fallbackOrder.paymentStatus = paymentStatus;
      }

      if (trackingNumber !== undefined) {
        fallbackOrder.trackingNumber = String(trackingNumber || '').trim();
      }

      fallbackOrder.updatedAt = new Date().toISOString();

      return res.json({
        message: 'Order updated successfully',
        order: cloneFallbackValue(fallbackOrder),
        source: 'fallback',
      });
    }

    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();
    }
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const existingOrder = await Order.findById(req.params.id).select(
      'paymentStatus orderNumber totalAmount'
    );

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('products.productId', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      paymentStatus === 'paid' &&
      existingOrder &&
      existingOrder.paymentStatus !== 'paid'
    ) {
      await createAdminNotification({
        title: 'Payment Received',
        message: `${order.orderNumber || 'Order'} payment has been confirmed.`,
        type: 'success',
        metadata: {
          orderId: order._id,
          totalAmount: order.totalAmount,
        },
      });
    }

    res.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const orderIndex = fallbackOrders.findIndex(
        (order) => String(order._id) === String(req.params.id)
      );

      if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const fallbackOrder = fallbackOrders[orderIndex];

      if (!fallbackOrder.inventoryReleasedAt && fallbackOrder.paymentStatus !== 'paid') {
        releaseFallbackInventory(fallbackOrder);
      }

      fallbackOrders.splice(orderIndex, 1);

      return res.json({ message: 'Order deleted successfully', source: 'fallback' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.inventoryReleasedAt && order.paymentStatus !== 'paid') {
      await releaseInventory(order);
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error deleting order' });
  }
});

module.exports = router;
