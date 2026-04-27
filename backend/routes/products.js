const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');
const {
  createFallbackId,
  getFallbackCatalogSnapshot,
  addFallbackProduct,
  replaceFallbackProduct,
  updateFallbackProductById,
} = require('../services/fallbackCatalogStore');

const router = express.Router();
const allowedCategories = new Set(['gin', 'vodka', 'rum', 'whiskey', 'liqueur', 'other']);
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizeText = (value = '') => String(value || '').trim();
const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
      return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
      return false;
    }
  }

  return fallback;
};

const parseStringArray = (value, fallback = []) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/,|\n/)
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return fallback;
};

const normalizeImages = (value, fallback = []) => {
  if (Array.isArray(value)) {
    const normalizedImages = value
      .map((image) => {
        if (!image || typeof image !== 'object') {
          return null;
        }

        const url = normalizeText(image.url);
        if (!url) {
          return null;
        }

        return {
          url,
          alt: normalizeText(image.alt),
        };
      })
      .filter(Boolean);

    return normalizedImages.length > 0 ? normalizedImages : fallback;
  }

  if (value && typeof value === 'object') {
    const url = normalizeText(value.url);
    if (url) {
      return [
        {
          url,
          alt: normalizeText(value.alt),
        },
      ];
    }
  }

  if (typeof value === 'string') {
    const url = normalizeText(value);
    if (url) {
      return [{ url, alt: '' }];
    }
  }

  return fallback;
};

const normalizeCategory = (value, fallback = 'other') => {
  const normalizedCategory = normalizeText(value).toLowerCase();

  if (allowedCategories.has(normalizedCategory)) {
    return normalizedCategory;
  }

  return fallback;
};

const getPaginationParams = ({ limit, page }) => {
  const parsedLimit = Number.parseInt(limit, 10);
  const parsedPage = Number.parseInt(page, 10);
  const limitNum = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
  const pageNum = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    limitNum,
    pageNum,
    skip: (pageNum - 1) * limitNum,
  };
};

const getFallbackCatalog = () =>
  getFallbackCatalogSnapshot().map((product) => ({
    ...product,
    images: Array.isArray(product.images) ? product.images.map((image) => ({ ...image })) : [],
    ingredients: Array.isArray(product.ingredients) ? [...product.ingredients] : [],
    tastingNotes: Array.isArray(product.tastingNotes) ? [...product.tastingNotes] : [],
    origin: product.origin ? { ...product.origin } : {},
  }));

const buildFallbackProduct = (payload = {}, current = {}) => {
  const source = {
    ...current,
    ...payload,
  };
  const currentOrigin = current.origin && typeof current.origin === 'object' ? current.origin : {};
  const payloadOrigin = payload.origin && typeof payload.origin === 'object' ? payload.origin : {};
  const resolvedPrice = parseNumber(source.price, current.price ?? 0);
  const resolvedWholesalePrice =
    source.wholesalePrice === '' || source.wholesalePrice === null || source.wholesalePrice === undefined
      ? undefined
      : parseNumber(source.wholesalePrice, current.wholesalePrice ?? 0);

  return {
    ...current,
    ...source,
    name: normalizeText(source.name),
    description: normalizeText(source.description),
    shortDescription: normalizeText(source.shortDescription),
    price: resolvedPrice,
    wholesalePrice: resolvedWholesalePrice,
    images: normalizeImages(source.images, current.images || []),
    category: normalizeCategory(source.category, normalizeCategory(current.category, 'other')),
    abv: parseNumber(source.abv, current.abv ?? 0),
    volume: parseNumber(source.volume, current.volume ?? 0),
    ingredients: parseStringArray(source.ingredients, current.ingredients || []),
    stock: parseNumber(source.stock, current.stock ?? 0),
    isFeatured: parseBoolean(source.isFeatured, current.isFeatured ?? false),
    isActive: parseBoolean(source.isActive, current.isActive ?? true),
    tastingNotes: parseStringArray(source.tastingNotes, current.tastingNotes || []),
    origin: {
      distillery: normalizeText(payloadOrigin.distillery || currentOrigin.distillery || 'Muwas Distilling'),
      location: normalizeText(payloadOrigin.location || currentOrigin.location || 'Uganda'),
    },
    updatedAt: new Date().toISOString(),
  };
};

const validateFallbackProduct = (product) => {
  if (!product.name || !product.description || !product.shortDescription) {
    return 'Name, description, and short description are required.';
  }

  if (!allowedCategories.has(product.category)) {
    return 'Invalid category value.';
  }

  if (!Number.isFinite(product.price) || product.price < 0) {
    return 'Price must be a non-negative number.';
  }

  if (!Number.isFinite(product.abv) || product.abv < 0) {
    return 'ABV must be a non-negative number.';
  }

  if (!Number.isFinite(product.volume) || product.volume <= 0) {
    return 'Volume must be greater than zero.';
  }

  if (!Number.isFinite(product.stock) || product.stock < 0) {
    return 'Stock must be a non-negative number.';
  }

  return '';
};

router.get('/', async (req, res) => {
  try {
    const { category, featured, limit, page = 1 } = req.query;
    const { limitNum, pageNum, skip } = getPaginationParams({ limit, page });

    if (!isDatabaseReady()) {
      let products = getFallbackCatalog().filter((product) => product.isActive !== false);

      if (category) {
        products = products.filter((product) => product.category === category);
      }

      if (featured === 'true') {
        products = products.filter((product) => product.isFeatured === true);
      }

      const total = products.length;

      return res.json({
        products: products.slice(skip, skip + limitNum),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        source: 'fallback',
      });
    }

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const products = await Product.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(filter);

    return res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const products = getFallbackCatalog()
        .filter((product) => product.isFeatured && product.isActive !== false)
        .slice(0, 8);

      return res.json({ products, source: 'fallback' });
    }

    const products = await Product.find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(8);

    return res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    return res.status(500).json({ message: 'Server error fetching featured products' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const categories = [...new Set(
        getFallbackCatalog()
          .filter((product) => product.isActive !== false)
          .map((product) => product.category)
          .filter(Boolean)
      )];

      return res.json({ categories, source: 'fallback' });
    }

    const categories = await Product.distinct('category', { isActive: true });
    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Server error fetching categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const product = getFallbackCatalog().find(
        (item) => String(item._id) === String(req.params.id) && item.isActive !== false
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json({ product, source: 'fallback' });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Server error fetching product' });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const candidate = buildFallbackProduct(req.body, {
        _id: createFallbackId(`${Date.now()}-${Math.floor(Math.random() * 1000)}`),
        createdAt: new Date().toISOString(),
        isActive: true,
      });
      const validationMessage = validateFallbackProduct(candidate);

      if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
      }

      addFallbackProduct(candidate);

      return res.status(201).json({
        message: 'Product created successfully',
        product: candidate,
        source: 'fallback',
      });
    }

    const product = new Product(req.body);
    await product.save();

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Server error creating product' });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const currentProduct = getFallbackCatalog().find(
        (product) => String(product._id) === String(req.params.id)
      );

      if (!currentProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const candidate = buildFallbackProduct(req.body, currentProduct);
      const validationMessage = validateFallbackProduct(candidate);

      if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
      }

      replaceFallbackProduct(req.params.id, candidate);

      return res.json({
        message: 'Product updated successfully',
        product: candidate,
        source: 'fallback',
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Server error updating product' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const updatedProduct = updateFallbackProductById(req.params.id, (currentProduct) => ({
        ...currentProduct,
        isActive: false,
        updatedAt: new Date().toISOString(),
      }));

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json({
        message: 'Product deleted successfully',
        source: 'fallback',
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
